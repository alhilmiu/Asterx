migrate((app) => {
    // Cari collection clients yang sudah ada.
    const clients = app.findCollectionByNameOrId("clients");

    // Buat collection projects baru.
    const collection = new Collection({
        type: "base",
        name: "projects",

        listRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
        viewRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
        createRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
        updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
        deleteRule: '@request.auth.role = "owner"',

        fields: [
            {
                type: "text",
                name: "project_name",
                required: true,
                max: 200
            },
            {
                type: "text",
                name: "project_code",
                required: true,
                max: 50
            },
            {
                type: "relation",
                name: "client",
                collectionId: clients.id,
                cascadeDelete: false,
                maxSelect: 1
            },
            {
                type: "select",
                name: "project_type",
                maxSelect: 1,
                values: [
                    "company_profile",
                    "landing_page",
                    "ecommerce",
                    "web_application",
                    "maintenance",
                    "other"
                ]
            },
            {
                type: "select",
                name: "status",
                required: true,
                maxSelect: 1,
                values: [
                    "planning",
                    "in_progress",
                    "review",
                    "completed",
                    "cancelled"
                ]
            },
            {
                type: "date",
                name: "start_date"
            },
            {
                type: "date",
                name: "deadline"
            },
            {
                type: "date",
                name: "completion_date"
            },
            {
                type: "number",
                name: "contract_value",
                min: 0
            },
            {
                type: "number",
                name: "down_payment",
                min: 0
            },
            {
                type: "text",
                name: "notes",
                max: 5000
            }
        ]
    });

    app.save(collection);
}, (app) => {
    // Tidak menghapus collection atau data saat rollback.
});