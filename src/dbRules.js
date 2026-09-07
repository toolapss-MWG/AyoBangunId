export const rules = `
{
  "rules": {
    "roles": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (
          root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
          root.child('roles').child(auth.uid).child('role').val() === 'admin'
        )"
      }
    },

    "projects": {
      "$pid": {
        ".read": "auth != null && (
          root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
          root.child('roles').child(auth.uid).child('role').val() === 'admin' ||
          (root.child('roles').child(auth.uid).child('role').val() === 'mandor' && root.child('roles').child(auth.uid).child('projectId').val() === $pid)
        )",

        "meta": {
          ".write": "auth != null && (
            root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
            root.child('roles').child(auth.uid).child('role').val() === 'admin'
          )"
        },

        "attendance": {
          "$dateISO": {
            ".read": "auth != null",
            "$uid": {
              ".write": "auth != null && (
                root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                root.child('roles').child(auth.uid).child('role').val() === 'admin' ||
                root.child('roles').child(auth.uid).child('role').val() === 'mandor'
              )"
            }
          }
        },

        "materials": {
          "catalog": {
            "$itemId": {
              ".read": "auth != null",
              ".write": "auth != null && (
                root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                root.child('roles').child(auth.uid).child('role').val() === 'admin'
              )",
              "variants": {
                ".read": "auth != null",
                ".write": "auth != null && (
                  root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'admin'
                )"
              }
            }
          },

          "stock": {
            "$itemId": {
              "$variantId": {
                ".read": "auth != null",
                ".write": "auth != null && (
                  root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'admin'
                )"
              }
            }
          },

          "usage": {
            ".read": "auth != null",
            "$dateISO": {
              "$usageId": {
                ".write": "auth != null && (
                  root.child('roles').child(auth.uid).child('role').val() === 'mandor' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'admin'
                )"
              }
            }
          },

          "opname": {
            "$dateISO": {
              "$opnameId": {
                ".read": "auth != null",
                ".write": "auth != null && (
                  root.child('roles').child(auth.uid).child('role').val() === 'mandor' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                  root.child('roles').child(auth.uid).child('role').val() === 'admin'
                )"
              }
            }
          }
        },

        "targets": {
          ".read": "auth != null",
          "$dateISO": {
            ".write": "auth != null && (
              root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
              root.child('roles').child(auth.uid).child('role').val() === 'admin'
            )"
          }
        },

        "dailyProgress": {
          ".read": "auth != null",
          "$dateISO": {
            "$key": {
              ".write": "auth != null && (
                root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                root.child('roles').child(auth.uid).child('role').val() === 'admin' ||
                root.child('roles').child(auth.uid).child('role').val() === 'mandor'
              )"
            }
          }
        },

        "constraints": {
          ".read": "auth != null",
          "$dateISO": {
            "$cid": {
              ".write": "auth != null && (
                root.child('roles').child(auth.uid).child('role').val() === 'owner' ||
                root.child('roles').child(auth.uid).child('role').val() === 'admin' ||
                root.child('roles').child(auth.uid).child('role').val() === 'mandor'
              )"
            }
          }
        }
      }
    }
  }
}
`;
