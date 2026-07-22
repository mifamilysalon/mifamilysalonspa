async function derive(password, salt, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

const iterations = 25000;
const saltOwner = crypto.getRandomValues(new Uint8Array(16));
const saltPin = crypto.getRandomValues(new Uint8Array(16));
const ownerKey = await derive("SalonOwner2026!", saltOwner, iterations);
const pinKey = await derive("1234", saltPin, iterations);

const owner = `pbkdf2$${iterations}$${b64(saltOwner)}$${b64(ownerKey)}`;
const pin = `pbkdf2$${iterations}$${b64(saltPin)}$${b64(pinKey)}`;

console.log(owner);
console.log(pin);
