/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4255710914")

  // update collection data
  unmarshal({
    "createRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
    "deleteRule": "\n@request.auth.role = \"owner\"\n",
    "listRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
    "updateRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
    "viewRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4255710914")

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
