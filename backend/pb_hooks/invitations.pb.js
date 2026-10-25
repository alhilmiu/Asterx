
// ============================================
// TRIMI - DIGITAL INVITATIONS HOOKS
// PocketBase v0.40.5
// ============================================

// --------------------------------------------
// 1. PUBLIK: AMBIL DATA UNDANGAN BERDASARKAN SLUG
// GET /api/trimi/invitations/public/{slug}
// --------------------------------------------
routerAdd(
  "GET",
  "/api/trimi/invitations/public/{slug}",
  (e) => {
    const slug = (e.request.pathValue("slug") || "").trim().toLowerCase();

    if (!slug || slug.length < 2) {
      throw new NotFoundError("Slug undangan tidak valid.");
    }

    let invitation;
    try {
      invitation = $app.findFirstRecordByFilter(
        "invitations",
        "slug = {:slug}",
        { slug: slug }
      );
    } catch (_) {
      throw new NotFoundError("Undangan tidak ditemukan.");
    }

    const auth = e.auth;
    const isStaff = auth && (auth.get("role") === "owner" || auth.get("role") === "manager" || auth.get("role") === "admin");

    // Jika bukan staf internal, undangan WAJIB sudah dibayar (paid) dan aktif (active)
    if (!isStaff) {
      if (invitation.get("payment_status") !== "paid" || !invitation.get("is_active")) {
        throw new NotFoundError("Undangan belum diterbitkan atau belum aktif.");
      }
    }

    // Naikkan view_count secara aman
    try {
      const currentViews = Number(invitation.get("view_count") || 0);
      invitation.set("view_count", currentViews + 1);
      $app.save(invitation);
    } catch (_) {}

    // Ambil data template terkait
    let templateData = null;
    try {
      const templateRecord = $app.findRecordById(
        "invitation_templates",
        invitation.get("template")
      );
      templateData = {
        id: templateRecord.id,
        name: templateRecord.get("name"),
        slug: templateRecord.get("slug"),
        preview_component: templateRecord.get("preview_component"),
        category: templateRecord.get("category"),
      };
    } catch (_) {}

    // Ambil daftar ucapan RSVP yang visible
    let rsvps = [];
    try {
      const rsvpRecords = $app.findRecordsByFilter(
        "invitation_rsvps",
        "invitation = {:invitationId} && is_visible = true",
        "-id",
        100,
        0,
        { invitationId: invitation.id }
      );

      for (let i = 0; i < rsvpRecords.length; i++) {
        rsvps.push({
          id: rsvpRecords[i].id,
          guest_name: rsvpRecords[i].get("guest_name"),
          attendance: rsvpRecords[i].get("attendance"),
          guest_count: rsvpRecords[i].get("guest_count"),
          wishes_message: rsvpRecords[i].get("wishes_message"),
          created: rsvpRecords[i].get("created"),
        });
      }
    } catch (_) {}

    return e.json(200, {
      success: true,
      invitation: {
        id: invitation.id,
        title: invitation.get("title"),
        slug: invitation.get("slug"),
        event_type: invitation.get("event_type"),
        event_date: invitation.get("event_date"),
        content_data: invitation.get("content_data"),
        cover_image: invitation.get("cover_image"),
        music_url: invitation.get("music_url"),
        music_file: invitation.get("music_file"),
        gallery_images: invitation.get("gallery_images"),
        payment_status: invitation.get("payment_status"),
        is_active: invitation.get("is_active"),
        rsvp_enabled: invitation.get("rsvp_enabled"),
        view_count: invitation.get("view_count"),
        created: invitation.get("created"),
      },
      template: templateData,
      rsvps: rsvps,
      isStaffPreview: isStaff && invitation.get("payment_status") !== "paid",
    });
  }
);

// --------------------------------------------
// 2. ADMIN: VERIFIKASI PEMBAYARAN & TERBITKAN UNDANGAN
// POST /api/trimi/invitations/publish
// --------------------------------------------
routerAdd(
  "POST",
  "/api/trimi/invitations/publish",
  (e) => {
    const auth = e.auth;
    if (!auth) {
      throw new UnauthorizedError("Silakan login terlebih dahulu.");
    }
    const role = auth.get("role");
    if (role !== "owner" && role !== "manager") {
      throw new ForbiddenError("Hanya owner atau manager yang dapat menerbitkan undangan.");
    }

    const body = new DynamicModel({
      invitationId: "",
      orderId: "",
    });
    e.bindBody(body);

    if (!body.invitationId) {
      throw new BadRequestError("invitationId wajib diisi.");
    }

    const invitation = $app.findRecordById("invitations", body.invitationId);
    // Publish only activates the invitation; payment status must be verified manually.
    invitation.set("is_active", true);
    $app.save(invitation);

    // Update order jika diberikan
    if (body.orderId) {
      try {
        const order = $app.findRecordById("invitation_orders", body.orderId);
        // Verify that the order belongs to the invitation being published
        if (order.get("invitation") !== invitation.id) {
          throw new BadRequestError("orderId tidak cocok dengan undangan yang dipublikasikan.");
        }
        // Admin confirms pembayaran secara manual; hanya menandai sebagai paid
        order.set("payment_status", "paid");
        order.set("paid_at", new Date().toISOString());
        $app.save(order);
      } catch (err) {
        // Propagate error as JSON response
        return e.json(400, { success: false, message: err.message || "Gagal memperbarui order." });
      }
    }

    return e.json(200, {
      success: true,
      message: "Undangan berhasil diterbitkan dan status pembayaran diset Lunas.",
      invitationSlug: invitation.get("slug"),
      publicUrl: "/i/" + invitation.get("slug"),
    });
  },
  $apis.requireAuth()
);
