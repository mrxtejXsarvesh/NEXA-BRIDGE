

## Problem Analysis

Institution signup ke baad profile student jaisi ban rahi hai kyunki `useAuth.tsx` me ek bug hai:

**Line 103 (`src/hooks/useAuth.tsx`)**:
```typescript
const roleToInsert = selectedRole === 'institution' ? 'institution' : 'student';
```
Ye line har non-institution role ko forcefully `student` bana deti hai. Agar alumni select karo to bhi student ban jayega. Aur institution ke case me bhi, agar client-side upsert trigger se pehle run ho jaye to race condition ho sakta hai.

## Plan

### 1. Fix role insertion in `useAuth.tsx`
- Line 103 change: `const roleToInsert = selectedRole;` — directly use whatever role user selected
- This ensures institution, alumni, student — sab correct role insert hota hai

### 2. Fix existing broken institution users (migration)
- Run an UPDATE query to fix any existing users who signed up as institution but got student role
- Check `auth.users` metadata for `role = 'institution'` and update their `user_roles` accordingly

### Technical Details
- **File**: `src/hooks/useAuth.tsx` line 103
- **Change**: Replace hardcoded ternary with direct `selectedRole` usage
- **Migration**: Update mismatched roles in `user_roles` table based on auth metadata

