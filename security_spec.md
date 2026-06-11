# Firebase Security Specifications: E-Wallet Agent

This security specification implements hard validation constraints, anti-poisoning ID guards, and tiered state logic according to the **8 Pillars of Hardened Rules** to ensure secure transaction management.

## 1. Core Data Invariants

1. **User Identity Security**: Users cannot alter their roles inside Firestore. Only Admins can modify client profile statuses.
2. **Deposit & Withdrawal Commmission Invariant**: Deposit rates must evaluate to exactly 5% (`0.05`) of the transaction volume. Withdrawal rates must evaluate to exactly 3% (`0.03`) of the transaction volume.
3. **Approval Status Invariant**: Agents who are marked as `suspended` or `pending` cannot execute new transactions, cash-outs, or and billing. They must be in `approved` state.
4. **Agent Wallet Integrity**: Transaction amounts must match what's processed, and commissions must balance perfectly to prevent "Denial of Wallet" exploits.
5. **Private Contacts Isolation**: Personally Identifiable Information (such as precise email/phone of customers and agents) is isolated. Only the owner agent or an active administrator can view or execute.

---

## 2. The "Dirty Dozen" Threat Payloads

Here are twelve specific JSON payloads designed to violate system constraints:

1. **Self-Appointed Administrator Upgrade**
   - *Target*: `/users/agent_attacker`
   - *Attack*: Attempting to claim the `admin` role directly on signup.
   - *Outcome*: `PERMISSION_DENIED`

2. **Poisoned Subcollection Hack**
   - *Target*: `/agents/some_agent/unbounded_secret_list/poison`
   - *Attack*: Storing high volume arrays inside documents to exhaust memory limits.
   - *Outcome*: `PERMISSION_DENIED`

3. **High Commission Spoofing (Deposit)**
   - *Target*: `/transactions/tx_deposit_leak`
   - *Attack*: Creating a `deposit` transaction where `commissionEarned` is engineered to be 95% of the capital instead of 5%.
   - *Outcome*: `PERMISSION_DENIED`

4. **Negative Capital Value Poisoning**
   - *Target*: `/transactions/tx_negative_heist`
   - *Attack*: Setting transaction volume to `-50,000 BDT` to synthetically inflate balances on subtraction.
   - *Outcome*: `PERMISSION_DENIED`

5. **Approval Override Bypass**
   - *Target*: `/agents/agent_attacker`
   - *Attack*: Modifying status to `approved` without admin verification.
   - *Outcome*: `PERMISSION_DENIED`

6. **Suspended Agent Operation Exploit**
   - *Target*: `/transactions/tx_frozen_leak`
   - *Attack*: Writing a transaction as an agent whose status in `/agents/uid` is `suspended`.
   - *Outcome*: `PERMISSION_DENIED`

7. **Client-Controlled Timestamp Masking**
   - *Target*: `/transactions/tx_old_spoof`
   - *Attack*: Backdating transaction `timestamp` to falsify metrics.
   - *Outcome*: `PERMISSION_DENIED` (enforces strictly `request.time`)

8. **Foreign Agent Customer Scraping**
   - *Target*: `/customers/customer_victim`
   - *Attack*: Unauthorized reading of another agent's customer repository database.
   - *Outcome*: `PERMISSION_DENIED`

9. **Terminal Commission Override**
   - *Target*: `/commissions/comm_382`
   - *Attack*: Updating a completed commission value after the transaction settles.
   - *Outcome*: `PERMISSION_DENIED` (immutable locking)

10. **Referral Self-Payout Reward Trap**
    - *Target*: `/referrals/ref_identity_theft`
    - *Attack*: Specifying `referredAgentId` and `referrerAgentId` as the exact same user ID to earn the 500 BDT bonus.
    - *Outcome*: `PERMISSION_DENIED`

11. **ID Poisoning Attack (Junk Identifier)**
    - *Target*: `/customers/A%%%%$$$@@_JUNKID_POISON_1_MB_LONG_STRING`
    - *Attack*: Attempting to inject irregular non-alphanumeric unicode patterns to poison indices.
    - *Outcome*: `PERMISSION_DENIED`

12. **Blanket Broadcaster PII Scraping**
    - *Target*: `/notifications/secret_notif`
    - *Attack*: Attempting to read isolated private administrator communications addressed to specific agents.
    - *Outcome*: `PERMISSION_DENIED`

---

## 3. Test Assertion Plan

The code handles test simulation through strict validation assertions represented in the security module, ensuring:
- Safe authentication verification (`request.auth != null`)
- Zero-trust field-matching filters (`affectedKeys()`)
- Role authority separation (`get(/databases/$(database)/documents/users/$(request.auth.uid))`)
