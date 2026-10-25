
migrate((app) => {
  const projects = app.findCollectionByNameOrId("projects");
  const clients = app.findCollectionByNameOrId("clients");

  const payments = new Collection({
    name: "payments",
    type: "base",
    listRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    viewRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    createRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner"',
    fields: [
      {
        name: "project",
        type: "relation",
        required: false,
        collectionId: projects.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "client",
        type: "relation",
        required: false,
        collectionId: clients.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "payment_date", type: "date", required: false },
      { name: "amount", type: "number", required: true, min: 0 },
      {
        name: "payment_type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["down_payment", "installment", "final_payment", "other"],
      },
      {
        name: "payment_method",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["cash", "bank_transfer", "e_wallet", "other"],
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "paid", "cancelled"],
      },
      { name: "reference_number", type: "text", required: false, max: 255 },
      { name: "notes", type: "text", required: false, max: 5000 },
    ],
  });

  app.save(payments);

  const invoices = new Collection({
    name: "invoices",
    type: "base",
    listRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    viewRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    createRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner"',
    fields: [
      { name: "invoice_number", type: "text", required: true, max: 100 },
      {
        name: "project",
        type: "relation",
        required: false,
        collectionId: projects.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "client",
        type: "relation",
        required: false,
        collectionId: clients.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      { name: "issue_date", type: "date", required: true },
      { name: "due_date", type: "date", required: false },
      { name: "amount", type: "number", required: true, min: 0 },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["draft", "unpaid", "partially_paid", "paid", "overdue", "cancelled"],
      },
      { name: "notes", type: "text", required: false, max: 5000 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invoices_invoice_number ON invoices (invoice_number)",
    ],
  });

  app.save(invoices);
}, (app) => {
  const invoices = app.findCollectionByNameOrId("invoices");
  const payments = app.findCollectionByNameOrId("payments");

  app.delete(invoices);
  app.delete(payments);
});
