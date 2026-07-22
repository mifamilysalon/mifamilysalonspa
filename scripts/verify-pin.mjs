const hash =
  "pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=";
const parts = hash.split("$");
console.log("parts", parts);

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
  return Buffer.from(bits).toString("base64");
}

const salt = Buffer.from(parts[2], "base64");
const actual = await derive("1234", salt, Number(parts[1]));
console.log("expected", parts[3]);
console.log("actual  ", actual);
console.log("match", actual === parts[3]);
