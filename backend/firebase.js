const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json"); // ✅ Match filename & path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
module.exports = admin;
