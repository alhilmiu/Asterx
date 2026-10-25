/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\" || @request.auth.role = \"admin\"",
    "deleteRule": "@request.auth.role = \"owner\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\" || @request.auth.role = \"admin\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
