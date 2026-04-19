# Security Spec

1. Data Invariants:
- A user can only read and update their own document, and cannot change their `role`, `quota`, `plan`, or `apiKey` themselves after creation.
- Only admins can read all users and modify user `role`, `quota`, `plan`, `apiKey`.
- Admins are defined by `request.auth.token.email == 'soothirote.nikon@gmail.com'`.

2. The "Dirty Dozen" Payloads:
- Payload 1: Create user with `role: 'admin'`. (Should be denied)
- Payload 2: Update `quota` as normal user. (Should be denied)
- Payload 3: Create without required fields. (Denied)
- Payload 4: Update with wrong types (quota as string). (Denied)
...

(Spec ensures all invariants mapped correctly in firestore.rules)
