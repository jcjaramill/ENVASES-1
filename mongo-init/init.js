db = db.getSiblingDB("mantencion");

db.createUser({
  user: "mongo_user",
  pwd: "dobleq3",
  roles: [
    { role: "readWrite", db: "mantencion" }
  ]
});
