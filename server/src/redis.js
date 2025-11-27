import Redis from "ioredis";

const {
  REDIS_HOST = "localhost",
  REDIS_PORT = 6379,
  REDIS_CHANNEL = "whiteboard-events",
  INSTANCE_NAME = "board-instance",
} = process.env;

const pub = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

const sub = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

// Subscribe to the shared channel
sub.subscribe(REDIS_CHANNEL, (err) => {
  if (err) {
    console.error("Failed to subscribe to Redis channel:", err);
  } else {
    console.log(`[${INSTANCE_NAME}] Subscribed to Redis channel: ${REDIS_CHANNEL}`);
  }
});

export { pub, sub, REDIS_CHANNEL, INSTANCE_NAME };
