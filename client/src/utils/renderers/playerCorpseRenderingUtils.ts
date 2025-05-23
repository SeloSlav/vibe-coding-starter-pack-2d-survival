import { PlayerCorpse as SpacetimeDBPlayerCorpse } from '../../generated/player_corpse_type';
import { Player as SpacetimeDBPlayer } from '../../generated/player_type';
import { renderPlayer, IDLE_FRAME_INDEX } from './playerRenderingUtils';
import { Identity, Timestamp } from '@clockworklabs/spacetimedb-sdk';

// Constants for shake effect
const SHAKE_DURATION_MS = 150;     // How long the shake effect lasts
const SHAKE_INTENSITY_PX = 8;     // Max pixel offset for corpse shake

interface RenderPlayerCorpseProps {
  ctx: CanvasRenderingContext2D;
  corpse: SpacetimeDBPlayerCorpse;
  nowMs: number;
  itemImagesRef: React.RefObject<Map<string, HTMLImageElement>>;
  cycleProgress: number;
  heroImageRef: React.RefObject<HTMLImageElement | null>;
}

export const PLAYER_CORPSE_INTERACTION_DISTANCE_SQUARED = 64.0 * 64.0;

/**
 * Renders a player corpse entity onto the canvas using player sprite logic.
 */
export function renderPlayerCorpse({
  ctx,
  corpse,
  nowMs,
  itemImagesRef,
  cycleProgress,
  heroImageRef,
}: RenderPlayerCorpseProps): void {
  
  // 1. Corpse Disappearance on Zero Health
  if (corpse.health === 0) {
    return; // Don't render if health is zero
  }

  const heroImg = heroImageRef.current;
  if (!heroImg) {
    console.warn("[renderPlayerCorpse] Hero image not loaded, cannot render corpse sprite.");
    return;
  }

  // Revert to using __timestamp_micros_since_unix_epoch__ as per the linter error
  const defaultTimestamp: Timestamp = { __timestamp_micros_since_unix_epoch__: 0n } as Timestamp;
  // Added a cast to Timestamp to satisfy the type if it has other non-data properties or methods.

  let renderPosX = corpse.posX;
  let renderPosY = corpse.posY;

  // 2. Shake Effect
  if (corpse.lastHitTime && corpse.lastHitTime.__timestamp_micros_since_unix_epoch__) { // Check if lastHitTime and its property exist
    const lastHitTimeMs = Number(corpse.lastHitTime.__timestamp_micros_since_unix_epoch__ / 1000n);
    const elapsedSinceHit = nowMs - lastHitTimeMs;

    if (elapsedSinceHit >= 0 && elapsedSinceHit < SHAKE_DURATION_MS) {
      const shakeFactor = 1.0 - (elapsedSinceHit / SHAKE_DURATION_MS); 
      const currentShakeIntensity = SHAKE_INTENSITY_PX * shakeFactor;
      const shakeOffsetX = (Math.random() - 0.5) * 2 * currentShakeIntensity;
      const shakeOffsetY = (Math.random() - 0.5) * 2 * currentShakeIntensity;
      renderPosX += shakeOffsetX;
      renderPosY += shakeOffsetY;
    }
  }

  const mockPlayerForCorpse: SpacetimeDBPlayer = {
    identity: corpse.playerIdentity as Identity,
    username: corpse.username,
    positionX: renderPosX, // Use potentially shaken position
    positionY: renderPosY, // Use potentially shaken position
    direction: 'up', // Corpses usually face up or a fixed direction
    color: '#CCCCCC', // Desaturated color for dead state
    health: 0, // Mock player health is 0 as it's a corpse
    isDead: true,
    lastHitTime: undefined, // Mock player doesn't have its own last hit time for rendering
    jumpStartTimeMs: 0n,
    isSprinting: false,
    hunger: 0,
    thirst: 0,
    stamina: 0,
    lastUpdate: defaultTimestamp,
    lastStatUpdate: defaultTimestamp,
    warmth: 0,
    deathTimestamp: corpse.deathTime,
    isOnline: false,
    isTorchLit: false,
    lastConsumedAt: defaultTimestamp,
    isCrouching: false,
  };

  renderPlayer(
    ctx,
    mockPlayerForCorpse,
    heroImg,
    false, // isHero
    false, // isJumping
    false, // isMoving (corpse is static)
    IDLE_FRAME_INDEX, // Use idle frame, or a specific death frame if available
    nowMs,
    0, // worldTime (not critical for static corpse visual)
    false, // isCrouching (corpse is not crouching)
    undefined, // activeTool (corpse has no tool)
    undefined, // equippedArmor (corpse armor handled by inventory if looted)
    true // isCorpseOrSleeping (true to use death/sleeping pose)
  );
} 