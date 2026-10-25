/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const snapshot = [
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1582905952",
          "max": 0,
          "min": 0,
          "name": "method",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2279338944",
      "indexes": [
        "CREATE INDEX `idx_mfas_collectionRef_recordRef` ON `_mfas` (collectionRef,recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_mfas",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 8,
          "help": "",
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 0,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": true,
          "id": "text3866985172",
          "max": 0,
          "min": 0,
          "name": "sentTo",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_1638494021",
      "indexes": [
        "CREATE INDEX `idx_otps_collectionRef_recordRef` ON `_otps` (collectionRef, recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_otps",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text2462348188",
          "max": 0,
          "min": 0,
          "name": "provider",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1044722854",
          "max": 0,
          "min": 0,
          "name": "providerId",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2281828961",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_externalAuths_record_provider` ON `_externalAuths` (collectionRef, recordRef, provider)",
        "CREATE UNIQUE INDEX `idx_externalAuths_collection_provider` ON `_externalAuths` (collectionRef, provider, providerId)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_externalAuths",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text4228609354",
          "max": 0,
          "min": 0,
          "name": "fingerprint",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_4275539003",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_authOrigins_unique_pairs` ON `_authOrigins` (collectionRef, recordRef, fingerprint)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_authOrigins",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location:</p>\n<p><em>{ALERT_INFO}</em></p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>If this was you, you may disregard this email.</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": true
      },
      "authRule": "",
      "authToken": {
        "duration": 86400
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": null,
      "deleteRule": null,
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 0,
          "help": "",
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9]{50}",
          "help": "",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": [],
          "help": "",
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": [],
          "presentable": false,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "fileToken": {
        "duration": 180
      },
      "id": "pbc_3142635823",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey_pbc_3142635823` ON `_superusers` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email_pbc_3142635823` ON `_superusers` (`email`) WHERE `email` != ''"
      ],
      "listRule": null,
      "manageRule": null,
      "mfa": {
        "duration": 600,
        "enabled": false,
        "rule": ""
      },
      "name": "_superusers",
      "oauth2": {
        "enabled": false,
        "mappedFields": {
          "avatarURL": "",
          "id": "",
          "name": "",
          "username": ""
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": true,
      "type": "auth",
      "updateRule": null,
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p><i>If you didn't recently register, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 86400
      },
      "viewRule": null
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location:</p>\n<p><em>{ALERT_INFO}</em></p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>If this was you, you may disregard this email.</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": true
      },
      "authRule": "",
      "authToken": {
        "duration": 432000
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": "",
      "deleteRule": "id = @request.auth.id",
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 0,
          "help": "",
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9]{50}",
          "help": "",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": [],
          "help": "",
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": [],
          "presentable": false,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 255,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "file376926767",
          "maxSelect": 1,
          "maxSize": 0,
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          "name": "avatar",
          "presentable": false,
          "protected": false,
          "required": false,
          "system": false,
          "thumbs": [],
          "type": "file"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select1466534506",
          "maxSelect": 0,
          "name": "role",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "owner",
            "manager",
            "admin"
          ]
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "fileToken": {
        "duration": 180
      },
      "id": "_pb_users_auth_",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''"
      ],
      "listRule": "id = @request.auth.id",
      "manageRule": null,
      "mfa": {
        "duration": 600,
        "enabled": false,
        "rule": ""
      },
      "name": "users",
      "oauth2": {
        "enabled": false,
        "mappedFields": {
          "avatarURL": "avatar",
          "id": "",
          "name": "name",
          "username": ""
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": false,
      "type": "auth",
      "updateRule": "id = @request.auth.id && @request.body.role:changed = false",
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p><i>If you didn't recently register, please ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 86400
      },
      "viewRule": "id = @request.auth.id"
    },
    {
      "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text179493489",
          "max": 0,
          "min": 0,
          "name": "customer_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text2323309286",
          "max": 0,
          "min": 0,
          "name": "customer_phone",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1345189255",
          "max": 0,
          "min": 0,
          "name": "start_time",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text999008199",
          "max": 0,
          "min": 0,
          "name": "text",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date3042278353",
          "max": "",
          "min": "",
          "name": "event_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1096160257",
          "max": 0,
          "min": 0,
          "name": "end_time",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text2467634050",
          "max": 0,
          "min": 0,
          "name": "event_type",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1587448267",
          "max": 0,
          "min": 0,
          "name": "location",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text3849198542",
          "max": 0,
          "min": 0,
          "name": "package_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 0,
          "name": "status",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "inquiry",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 0,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_986407980",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "name": "bookings",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\" ",
      "viewRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\""
    },
    {
      "createRule": "@request.auth.role = \"owner\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text2411707748",
          "max": 0,
          "min": 0,
          "name": "client_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text491676904",
          "max": 0,
          "min": 0,
          "name": "company_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1146066909",
          "max": 0,
          "min": 0,
          "name": "phone",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text223244161",
          "max": 0,
          "min": 0,
          "name": "address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "exceptDomains": [],
          "help": "",
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": [],
          "presentable": false,
          "required": false,
          "system": false,
          "type": "email"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select1564644427",
          "maxSelect": 0,
          "name": "client_type",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "individual",
            "company"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select585827855",
          "maxSelect": 0,
          "name": "lead_source",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "whatsapp",
            "referral",
            "social_media",
            "website",
            "other"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 0,
          "name": "status",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "prospect",
            "active",
            "inactive"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 0,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_2442875294",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\"",
      "name": "clients",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\"",
      "viewRule": "@request.auth.role = \"owner\""
    },
    {
      "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1739765278",
          "max": 200,
          "min": 0,
          "name": "project_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1317337216",
          "max": 50,
          "min": 0,
          "name": "project_code",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_2442875294",
          "help": "",
          "hidden": false,
          "id": "relation3343123541",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "client",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select3041894193",
          "maxSelect": 1,
          "name": "project_type",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "company_profile",
            "landing_page",
            "ecommerce",
            "web_application",
            "maintenance",
            "other"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "planning",
            "in_progress",
            "review",
            "completed",
            "cancelled"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "date2502384312",
          "max": "",
          "min": "",
          "name": "start_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date3074913522",
          "max": "",
          "min": "",
          "name": "deadline",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date1111370926",
          "max": "",
          "min": "",
          "name": "completion_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "number1584841744",
          "max": null,
          "min": 0,
          "name": "contract_value",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "number1876659496",
          "max": null,
          "min": 0,
          "name": "down_payment",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 5000,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "pbc_484305853",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "name": "projects",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "viewRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\""
    },
    {
      "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_484305853",
          "help": "",
          "hidden": false,
          "id": "relation800313582",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "project",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_2442875294",
          "help": "",
          "hidden": false,
          "id": "relation3343123541",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "client",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date2333974542",
          "max": "",
          "min": "",
          "name": "payment_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "number2392944706",
          "max": null,
          "min": 0,
          "name": "amount",
          "onlyInt": false,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2908602461",
          "maxSelect": 1,
          "name": "payment_type",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "down_payment",
            "installment",
            "final_payment",
            "other"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2069996022",
          "maxSelect": 1,
          "name": "payment_method",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "cash",
            "bank_transfer",
            "e_wallet",
            "other"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "pending",
            "paid",
            "cancelled"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text2347871824",
          "max": 255,
          "min": 0,
          "name": "reference_number",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 5000,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_711030668",
          "help": "",
          "hidden": false,
          "id": "relation2422544196",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "invoice",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "pbc_631030571",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "name": "payments",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "viewRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\""
    },
    {
      "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text765886983",
          "max": 100,
          "min": 0,
          "name": "invoice_number",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_484305853",
          "help": "",
          "hidden": false,
          "id": "relation800313582",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "project",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_2442875294",
          "help": "",
          "hidden": false,
          "id": "relation3343123541",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "client",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date4068081590",
          "max": "",
          "min": "",
          "name": "issue_date",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date3866337329",
          "max": "",
          "min": "",
          "name": "due_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "help": "",
          "hidden": false,
          "id": "number2392944706",
          "max": null,
          "min": 0,
          "name": "amount",
          "onlyInt": false,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "draft",
            "unpaid",
            "partially_paid",
            "paid",
            "overdue",
            "cancelled"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 5000,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "pbc_711030668",
      "indexes": [
        "CREATE UNIQUE INDEX idx_invoices_invoice_number ON invoices (invoice_number)"
      ],
      "listRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "name": "invoices",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "viewRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\""
    },
    {
      "createRule": "@request.auth.role = \"owner\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1961786329",
          "max": 200,
          "min": 1,
          "name": "vendor_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text491676904",
          "max": 200,
          "min": 0,
          "name": "company_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1146066909",
          "max": 50,
          "min": 0,
          "name": "phone",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "exceptDomains": [],
          "help": "",
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": [],
          "presentable": false,
          "required": false,
          "system": false,
          "type": "email"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text223244161",
          "max": 2000,
          "min": 0,
          "name": "address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select105650625",
          "maxSelect": 1,
          "name": "category",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "design",
            "printing",
            "photography",
            "video",
            "catering",
            "venue",
            "decoration",
            "digital_service",
            "equipment",
            "other"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "active",
            "inactive"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text3756722627",
          "max": 500,
          "min": 0,
          "name": "payment_terms",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 5000,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "pbc_3732325883",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\"",
      "name": "vendors",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\"",
      "viewRule": "@request.auth.role = \"owner\""
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_711030668",
          "help": "",
          "hidden": false,
          "id": "relation2422544196",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "invoice",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_484305853",
          "help": "",
          "hidden": false,
          "id": "relation800313582",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "project",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text3015464922",
          "max": 128,
          "min": 0,
          "name": "token_hash",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool1260321794",
          "name": "active",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "bool"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date1891863194",
          "max": "",
          "min": "",
          "name": "activated_at",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        }
      ],
      "id": "pbc_1822064464",
      "indexes": [
        "CREATE UNIQUE INDEX idx_tracking_tokens_token_hash ON tracking_tokens (token_hash)",
        "CREATE UNIQUE INDEX idx_tracking_tokens_invoice ON tracking_tokens (invoice)"
      ],
      "listRule": null,
      "name": "tracking_tokens",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": null
    },
    {
      "createRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_484305853",
          "help": "",
          "hidden": false,
          "id": "relation800313582",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "project",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "date2129813733",
          "max": "",
          "min": "",
          "name": "update_date",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text724990059",
          "max": 150,
          "min": 0,
          "name": "title",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text3982716877",
          "max": 3000,
          "min": 0,
          "name": "public_message",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "planning",
            "in_progress",
            "review",
            "completed",
            "cancelled"
          ]
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool4127948390",
          "name": "visible_to_client",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "bool"
        }
      ],
      "id": "pbc_3172659911",
      "indexes": [
        "CREATE INDEX idx_project_updates_project_date ON project_updates (project, update_date)"
      ],
      "listRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "name": "project_updates",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\"",
      "viewRule": "@request.auth.role = \"owner\" || @request.auth.role = \"manager\""
    },
    {
      "createRule": "@request.auth.role = \"owner\"",
      "deleteRule": "@request.auth.role = \"owner\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_484305853",
          "help": "",
          "hidden": false,
          "id": "relation800313582",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "project",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_3732325883",
          "help": "",
          "hidden": false,
          "id": "relation4112659446",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "vendor",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text1915068645",
          "max": 2000,
          "min": 0,
          "name": "work_description",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "number405181692",
          "max": null,
          "min": 0,
          "name": "cost",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 1,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "planned",
            "in_progress",
            "completed",
            "cancelled"
          ]
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text18589324",
          "max": 5000,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "pbc_3078052838",
      "indexes": [],
      "listRule": "@request.auth.role = \"owner\"",
      "name": "project_vendors",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.role = \"owner\"",
      "viewRule": "@request.auth.role = \"owner\""
    },
    {
      "createRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
      "deleteRule": "\n@request.auth.role = \"owner\"\n",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        }
      ],
      "id": "pbc_4255710914",
      "indexes": [],
      "listRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
      "name": "operational_expenses",
      "system": false,
      "type": "base",
      "updateRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n",
      "viewRule": "\n@request.auth.role = \"owner\" || @request.auth.role = \"manager\"\n"
    }
  ];

  return app.importCollections(snapshot, false);
}, (app) => {
  return null;
})
