/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1185616639")

  // add field
  collection.fields.addAt(5, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "url2618047341",
    "name": "website_url",
    "onlyDomains": [],
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "url3747376442",
    "name": "demo_url",
    "onlyDomains": [],
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "file2359244304",
    "maxSelect": 0,
    "maxSize": 5,
    "mimeTypes": [],
    "name": "file",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number1169138922",
    "max": null,
    "min": null,
    "name": "sort_order",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1875119480",
    "name": "is_published",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1185616639")

  // remove field
  collection.fields.removeById("url2618047341")

  // remove field
  collection.fields.removeById("url3747376442")

  // remove field
  collection.fields.removeById("file2359244304")

  // remove field
  collection.fields.removeById("number1169138922")

  // remove field
  collection.fields.removeById("bool1875119480")

  return app.save(collection)
})
