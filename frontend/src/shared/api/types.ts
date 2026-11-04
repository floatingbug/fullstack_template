/**
 * Alias-Schicht auf die aus `contracts/openapi.bundled.yaml` generierten Typen.
 * Typen nicht hier definieren – `schema.d.ts` mit `npm run gen:api` neu erzeugen.
 */
import type { components } from './schema'

type Schemas = components['schemas']

export type User = Schemas['User']
export type SignInResponse = Schemas['SignInResponse']
export type MessageResponse = Schemas['Message']
export type ConfirmEmailChangeResponse = Schemas['ConfirmEmailChangeResponse']
export type AccountUpdateResult = Schemas['AccountUpdateResult']
