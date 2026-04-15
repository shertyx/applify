import redis from "@/lib/redis";

// ── Friends ────────────────────────────────────────────────────────────────

export async function getFriends(uid) {
  const [friends, received, sent] = await Promise.all([
    redis.get(`friends:${uid}`),
    redis.get(`requests:received:${uid}`),
    redis.get(`requests:sent:${uid}`),
  ]);
  return {
    friends: Array.isArray(friends) ? friends : [],
    received: Array.isArray(received) ? received : [],
    sent: Array.isArray(sent) ? sent : [],
  };
}

export async function sendFriendRequest(from, toEmail) {
  const toUser = await redis.hget("users:registry", toEmail);
  if (!toUser) return { success: false, error: "Utilisateur introuvable" };

  const to = typeof toUser === "string" ? JSON.parse(toUser) : toUser;

  const [friends, sent] = await Promise.all([
    redis.get(`friends:${from.email}`),
    redis.get(`requests:sent:${from.email}`),
  ]);

  const alreadyFriend = (Array.isArray(friends) ? friends : []).some((f) => f.email === toEmail);
  const alreadySent = (Array.isArray(sent) ? sent : []).some((r) => r.email === toEmail);
  if (alreadyFriend) return { success: false, error: "Déjà ami" };
  if (alreadySent) return { success: false, error: "Demande déjà envoyée" };

  const date = new Date().toISOString();

  const newSent = [...(Array.isArray(sent) ? sent : []), { ...to, date }];
  await redis.set(`requests:sent:${from.email}`, newSent);

  const received = await redis.get(`requests:received:${toEmail}`);
  const newReceived = [...(Array.isArray(received) ? received : []), { ...from, date }];
  await redis.set(`requests:received:${toEmail}`, newReceived);

  const notifs = await redis.get(`notifications:${toEmail}`);
  const newNotifs = [
    ...(Array.isArray(notifs) ? notifs : []),
    {
      id: Date.now(),
      type: "friend_request",
      from,
      message: `${from.name} vous a envoyé une demande d'ami`,
      date,
      read: false,
    },
  ];
  await redis.set(`notifications:${toEmail}`, newNotifs);

  return { success: true };
}

export async function respondFriendRequest(me, fromEmail, action) {
  const received = await redis.get(`requests:received:${me.email}`);
  const receivedList = Array.isArray(received) ? received : [];
  const requestExists = receivedList.some((r) => r.email === fromEmail);
  if (!requestExists) return { success: false, error: "Demande introuvable", status: 404 };

  const newReceived = receivedList.filter((r) => r.email !== fromEmail);
  await redis.set(`requests:received:${me.email}`, newReceived);

  const sent = await redis.get(`requests:sent:${fromEmail}`);
  const newSent = (Array.isArray(sent) ? sent : []).filter((r) => r.email !== me.email);
  await redis.set(`requests:sent:${fromEmail}`, newSent);

  if (action === "accept") {
    const fromUser = await redis.hget("users:registry", fromEmail);
    const from = typeof fromUser === "string" ? JSON.parse(fromUser) : fromUser;

    const [myFriends, theirFriends] = await Promise.all([
      redis.get(`friends:${me.email}`),
      redis.get(`friends:${fromEmail}`),
    ]);
    await redis.set(`friends:${me.email}`, [...(Array.isArray(myFriends) ? myFriends : []), from]);
    await redis.set(`friends:${fromEmail}`, [...(Array.isArray(theirFriends) ? theirFriends : []), me]);

    const notifs = await redis.get(`notifications:${fromEmail}`);
    const newNotifs = [
      ...(Array.isArray(notifs) ? notifs : []),
      {
        id: Date.now(),
        type: "friend_accepted",
        from: me,
        message: `${me.name} a accepté votre demande d'ami`,
        date: new Date().toISOString(),
        read: false,
      },
    ];
    await redis.set(`notifications:${fromEmail}`, newNotifs);
  }

  return { success: true };
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(uid) {
  const notifs = await redis.get(`notifications:${uid}`);
  return Array.isArray(notifs) ? notifs : [];
}

export async function markNotificationsRead(uid) {
  const notifs = await redis.get(`notifications:${uid}`);
  const read = (Array.isArray(notifs) ? notifs : []).map((n) => ({ ...n, read: true }));
  await redis.set(`notifications:${uid}`, read);
}

export async function pushNotification(toEmail, notification) {
  const notifs = await redis.get(`notifications:${toEmail}`);
  const updated = [...(Array.isArray(notifs) ? notifs : []), notification];
  await redis.set(`notifications:${toEmail}`, updated);
}

// ── Chat ───────────────────────────────────────────────────────────────────

export function chatKey(a, b) {
  return `chat:${[a, b].sort().join("|")}`;
}

export async function getMessages(userEmail, friendEmail) {
  const messages = await redis.get(chatKey(userEmail, friendEmail));
  return Array.isArray(messages) ? messages : [];
}

export async function sendMessage(from, toEmail, text) {
  const friends = await redis.get(`friends:${from.email}`);
  const isFriend = (Array.isArray(friends) ? friends : []).some((f) => f.email === toEmail);
  if (!isFriend) return { success: false, error: "Non autorisé", status: 403 };

  const key = chatKey(from.email, toEmail);
  const messages = await redis.get(key);
  const newMessages = [
    ...(Array.isArray(messages) ? messages : []),
    {
      id: Date.now(),
      from: from.email,
      fromName: from.name,
      fromImage: from.image,
      text: text.trim(),
      date: new Date().toISOString(),
    },
  ];
  const trimmed = newMessages.slice(-200);
  await redis.set(key, trimmed);

  const notifs = await redis.get(`notifications:${toEmail}`);
  const notifsList = Array.isArray(notifs) ? notifs : [];
  const recentMsg = notifsList.find(
    (n) => n.type === "message" && n.from.email === from.email && !n.read
  );
  if (!recentMsg) {
    await redis.set(`notifications:${toEmail}`, [
      ...notifsList,
      {
        id: Date.now(),
        type: "message",
        from: { email: from.email, name: from.name, image: from.image },
        message: `${from.name} vous a envoyé un message`,
        date: new Date().toISOString(),
        read: false,
      },
    ]);
  }

  return { success: true };
}

// ── Registry ───────────────────────────────────────────────────────────────

export async function registerUser(email, name, image) {
  await redis.hset("users:registry", { [email]: JSON.stringify({ email, name, image }) });
}

export async function searchUsers(q, excludeEmail) {
  const all = await redis.hgetall("users:registry");
  if (!all) return [];
  return Object.values(all)
    .map((v) => (typeof v === "string" ? JSON.parse(v) : v))
    .filter(
      (u) =>
        u.email !== excludeEmail &&
        (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    )
    .slice(0, 10);
}

// ── Account deletion ───────────────────────────────────────────────────────

export async function deleteUserData(uid) {
  await Promise.all([
    redis.del(`candidatures:${uid}`),
    redis.del(`corbeille:${uid}`),
    redis.del(`profil:${uid}`),
    redis.del(`offres:${uid}`),
    redis.del(`friends:${uid}`),
    redis.del(`requests:sent:${uid}`),
    redis.del(`requests:received:${uid}`),
    redis.del(`notifications:${uid}`),
  ]);

  await redis.hdel("users:registry", uid);

  const friends = await redis.get(`friends:${uid}`);
  if (Array.isArray(friends)) {
    for (const friend of friends) {
      const theirFriends = await redis.get(`friends:${friend.email}`);
      if (Array.isArray(theirFriends)) {
        await redis.set(
          `friends:${friend.email}`,
          theirFriends.filter((f) => f.email !== uid)
        );
      }
    }
  }

  try {
    const chatKeys = await redis.keys(`chat:*${uid}*`);
    if (chatKeys.length > 0) await Promise.all(chatKeys.map((k) => redis.del(k)));
  } catch {}
}
