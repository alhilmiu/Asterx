
// ============================================
// TRIMI - ORDER TRACKING
// PocketBase v0.40.5
// ============================================

// --------------------------------------------
// 1. ADMIN: BUAT / PERBARUI LINK TRACKING
// POST /api/trimi/tracking/create
// --------------------------------------------

routerAdd(
  "POST",
  "/api/trimi/tracking/create",
  (e) => {
    const auth = e.auth;

    if (!auth) {
      throw new UnauthorizedError(
        "Silakan login terlebih dahulu."
      );
    }

    const role = auth.get("role");

    if (role !== "owner" && role !== "manager") {
      throw new ForbiddenError(
        "Akses hanya untuk owner atau manager."
      );
    }

    const body = new DynamicModel({
      invoiceId: "",
    });

    e.bindBody(body);

    if (!body.invoiceId || !body.invoiceId.trim()) {
      throw new BadRequestError(
        "Invoice ID wajib diisi."
      );
    }

    const invoice = $app.findRecordById(
      "invoices",
      body.invoiceId.trim()
    );

    const invoiceId = invoice.id;
    const projectId = invoice.get("project");

    if (!projectId) {
      throw new BadRequestError(
        "Invoice belum terhubung dengan proyek."
      );
    }

    const project = $app.findRecordById(
      "projects",
      projectId
    );

    // Tracking hanya tersedia setelah DP benar-benar dibayar.
    let dpPaid = false;

    try {
      $app.findFirstRecordByFilter(
        "payments",
        'invoice = {:invoice} && payment_type = "down_payment" && status = "paid"',
        { invoice: invoiceId }
      );

      dpPaid = true;
    } catch (_) {
      dpPaid = false;
    }

    if (!dpPaid) {
      throw new BadRequestError(
        "Konfirmasikan pembayaran DP terlebih dahulu."
      );
    }

    const token = $security.randomString(64);
    const tokenHash = $security.sha256(token);

    let trackingRecord = null;

    try {
      trackingRecord = $app.findFirstRecordByFilter(
        "tracking_tokens",
        "invoice = {:invoice}",
        { invoice: invoiceId }
      );
    } catch (_) {
      trackingRecord = null;
    }

    if (!trackingRecord) {
      const collection = $app.findCollectionByNameOrId(
        "tracking_tokens"
      );

      trackingRecord = new Record(collection);
      trackingRecord.set("invoice", invoiceId);
    }

    trackingRecord.set("invoice", invoiceId);
    trackingRecord.set("project", projectId);
    trackingRecord.set("token_hash", tokenHash);
    trackingRecord.set("active", true);
    trackingRecord.set(
      "activated_at",
      new Date().toISOString()
    );

    $app.save(trackingRecord);

    return e.json(200, {
      success: true,
      message: "Link tracking berhasil dibuat.",
      invoiceNumber: invoice.get("invoice_number"),
      projectName: project.get("project_name"),
      token: token,
      trackingPath: "/tracking/" + token,
    });
  },
  $apis.requireAuth()
);


// --------------------------------------------
// 2. PUBLIK: AMBIL DATA TRACKING
// GET /api/trimi/tracking/{token}
// --------------------------------------------

routerAdd(
  "GET",
  "/api/trimi/tracking/{token}",
  (e) => {
    const token = e.request.pathValue("token");

    if (
      !token ||
      token.length < 32 ||
      token.length > 128
    ) {
      throw new NotFoundError(
        "Link tracking tidak valid."
      );
    }

    const tokenHash = $security.sha256(token);

    let tracking;

    try {
      tracking = $app.findFirstRecordByFilter(
        "tracking_tokens",
        "token_hash = {:hash} && active = true",
        { hash: tokenHash }
      );
    } catch (_) {
      throw new NotFoundError(
        "Link tracking tidak ditemukan atau tidak aktif."
      );
    }

    const projectId = tracking.get("project");
    const invoiceId = tracking.get("invoice");

    const project = $app.findRecordById(
      "projects",
      projectId
    );

    const invoice = $app.findRecordById(
      "invoices",
      invoiceId
    );

    if (invoice.get("project") !== project.id) {
      throw new NotFoundError(
        "Link tracking tidak berlaku."
      );
    }

    // Ambil pembaruan yang boleh dilihat customer.
    const updates = $app.findRecordsByFilter(
      "project_updates",
      "project = {:project} && visible_to_client = true",
      "sort_order,update_date",
      100,
      0,
      { project: projectId }
    );

    const safeUpdates = [];

    for (let i = 0; i < updates.length; i++) {
      safeUpdates.push({
        id: updates[i].id,
        sortOrder: updates[i].get("sort_order"),
        date: updates[i].get("update_date"),
        title: updates[i].get("title"),
        message: updates[i].get("public_message"),
        status: updates[i].get("status"),
      });
    }

    return e.json(200, {
      success: true,

      invoice: {
        invoiceNumber: invoice.get("invoice_number"),
      },

      project: {
        name: project.get("project_name"),
        code: project.get("project_code"),
        status: project.get("status"),
        startDate: project.get("start_date"),
        deadline: project.get("deadline"),
        completionDate: project.get("completion_date"),
        progressPercent: Number(
          project.get("progress_percent") || 0
        ),
      },

      updates: safeUpdates,
    });
  }
);
