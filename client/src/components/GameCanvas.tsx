import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  Player as SpacetimeDBPlayer,
  Tree as SpacetimeDBTree,
  Stone as SpacetimeDBStone,
  Campfire as SpacetimeDBCampfire,
  Mushroom as SpacetimeDBMushroom,
  WorldState as SpacetimeDBWorldState,
  ActiveEquipment as SpacetimeDBActiveEquipment,
  InventoryItem as SpacetimeDBInventoryItem,
  ItemDefinition as SpacetimeDBItemDefinition,
  DroppedItem as SpacetimeDBDroppedItem,
  WoodenStorageBox as SpacetimeDBWoodenStorageBox,
  PlayerPin as SpacetimeDBPlayerPin,
  ActiveConnection,
  Corn as SpacetimeDBCorn,
  Pumpkin as SpacetimeDBPumpkin,
  Hemp as SpacetimeDBHemp,
  SleepingBag as SpacetimeDBSleepingBag,
  PlayerCorpse as SpacetimeDBPlayerCorpse,
  Stash as SpacetimeDBStash,
  Cloud as SpacetimeDBCloud,
  ActiveConsumableEffect as SpacetimeDBActiveConsumableEffect,
  Grass as SpacetimeDBGrass,
  Projectile as SpacetimeDBProjectile,
  DeathMarker as SpacetimeDBDeathMarker
} from '../generated';

// --- Core Hooks ---
import { useAnimationCycle, useWalkingAnimationCycle } from '../hooks/useAnimationCycle';
import { useAssetLoader } from '../hooks/useAssetLoader';
import { useGameViewport } from '../hooks/useGameViewport';
import { useMousePosition } from '../hooks/useMousePosition';
import { useDayNightCycle } from '../hooks/useDayNightCycle';
import { useInteractionFinder } from '../hooks/useInteractionFinder';
import { useGameLoop } from '../hooks/useGameLoop';
import type { FrameInfo } from '../hooks/useGameLoop';
import { useInputHandler } from '../hooks/useInputHandler';
import { usePlayerHover } from '../hooks/usePlayerHover';
import { useMinimapInteraction } from '../hooks/useMinimapInteraction';
import { useEntityFiltering } from '../hooks/useEntityFiltering';
import { useSpacetimeTables } from '../hooks/useSpacetimeTables';
import { useCampfireParticles, Particle } from '../hooks/useCampfireParticles';
import { useTorchParticles } from '../hooks/useTorchParticles';
import { useCloudInterpolation, InterpolatedCloudData } from '../hooks/useCloudInterpolation';
import { useGrassInterpolation, InterpolatedGrassData } from '../hooks/useGrassInterpolation';

// --- Rendering Utilities ---
import { renderWorldBackground } from '../utils/renderers/worldRenderingUtils';
import { renderYSortedEntities } from '../utils/renderers/renderingUtils.ts';
import { renderInteractionLabels } from '../utils/renderers/labelRenderingUtils.ts';
import { renderPlacementPreview } from '../utils/renderers/placementRenderingUtils.ts';
import { drawInteractionIndicator } from '../utils/interactionIndicator';
import { drawMinimapOntoCanvas } from './Minimap';
import { renderCampfire } from '../utils/renderers/campfireRenderingUtils';
import { renderMushroom } from '../utils/renderers/mushroomRenderingUtils';
import { renderCorn } from '../utils/renderers/cornRenderingUtils';
import { renderPumpkin } from '../utils/renderers/pumpkinRenderingUtils';
import { renderHemp } from '../utils/renderers/hempRenderingUtils';
import { renderDroppedItem } from '../utils/renderers/droppedItemRenderingUtils.ts';
import { renderSleepingBag } from '../utils/renderers/sleepingBagRenderingUtils';
import { renderPlayerCorpse } from '../utils/renderers/playerCorpseRenderingUtils';
import { renderStash } from '../utils/renderers/stashRenderingUtils';
import { renderPlayerTorchLight, renderCampfireLight } from '../utils/renderers/lightRenderingUtils';
import { renderTree } from '../utils/renderers/treeRenderingUtils';
import { renderCloudsDirectly } from '../utils/renderers/cloudRenderingUtils';
import { renderProjectile } from '../utils/renderers/projectileRenderingUtils';
// --- Other Components & Utils ---
import DeathScreen from './DeathScreen.tsx';
import { itemIcons } from '../utils/itemIconUtils';
import { PlacementItemInfo, PlacementActions } from '../hooks/usePlacementManager';
import { HOLD_INTERACTION_DURATION_MS } from '../hooks/useInputHandler';
import { REVIVE_HOLD_DURATION_MS } from '../hooks/useInputHandler';
import {
    CAMPFIRE_HEIGHT, 
    SERVER_CAMPFIRE_DAMAGE_RADIUS, 
    SERVER_CAMPFIRE_DAMAGE_CENTER_Y_OFFSET
} from '../utils/renderers/campfireRenderingUtils';
import { BOX_HEIGHT } from '../utils/renderers/woodenStorageBoxRenderingUtils';
import { PLAYER_BOX_INTERACTION_DISTANCE_SQUARED } from '../hooks/useInteractionFinder';

// Define a placeholder height for Stash for indicator rendering
const STASH_HEIGHT = 40; // Adjust as needed to match stash sprite or desired indicator position

// Import cut grass effect renderer
import { renderCutGrassEffects } from '../effects/cutGrassEffect';

// --- Prop Interface ---
interface GameCanvasProps {
  players: Map<string, SpacetimeDBPlayer>;
  trees: Map<string, SpacetimeDBTree>;
  clouds: Map<string, SpacetimeDBCloud>;
  stones: Map<string, SpacetimeDBStone>;
  campfires: Map<string, SpacetimeDBCampfire>;
  mushrooms: Map<string, SpacetimeDBMushroom>;
  corns: Map<string, SpacetimeDBCorn>;
  pumpkins: Map<string, SpacetimeDBPumpkin>;
  hemps: Map<string, SpacetimeDBHemp>;
  droppedItems: Map<string, SpacetimeDBDroppedItem>;
  woodenStorageBoxes: Map<string, SpacetimeDBWoodenStorageBox>;
  sleepingBags: Map<string, SpacetimeDBSleepingBag>;
  playerCorpses: Map<string, SpacetimeDBPlayerCorpse>;
  stashes: Map<string, SpacetimeDBStash>;
  playerPins: Map<string, SpacetimeDBPlayerPin>;
  inventoryItems: Map<string, SpacetimeDBInventoryItem>;
  itemDefinitions: Map<string, SpacetimeDBItemDefinition>;
  activeConsumableEffects: Map<string, SpacetimeDBActiveConsumableEffect>;
  worldState: SpacetimeDBWorldState | null;
  activeConnections: Map<string, ActiveConnection> | undefined;
  localPlayerId?: string;
  connection: any | null;
  activeEquipments: Map<string, SpacetimeDBActiveEquipment>;
  grass: Map<string, SpacetimeDBGrass>;
  placementInfo: PlacementItemInfo | null;
  placementActions: PlacementActions;
  placementError: string | null;
  onSetInteractingWith: (target: { type: string; id: number | bigint } | null) => void;
  updatePlayerPosition: (moveX: number, moveY: number) => void;
  callJumpReducer: () => void;
  callSetSprintingReducer: (isSprinting: boolean) => void;
  isMinimapOpen: boolean;
  setIsMinimapOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isChatting: boolean;
  messages: any;
  isSearchingCraftRecipes?: boolean;
  showInventory: boolean;
  gameCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  projectiles: Map<string, SpacetimeDBProjectile>;
  deathMarkers: Map<string, SpacetimeDBDeathMarker>;
}

/**
 * GameCanvas Component
 *
 * The main component responsible for rendering the game world, entities, UI elements,
 * and handling the game loop orchestration. It integrates various custom hooks
 * to manage specific aspects like input, viewport, assets, day/night cycle, etc.
 */
const GameCanvas: React.FC<GameCanvasProps> = ({
  players,
  trees,
  clouds,
  stones,
  campfires,
  mushrooms,
  corns,
  pumpkins,
  hemps,
  droppedItems,
  woodenStorageBoxes,
  sleepingBags,
  playerCorpses,
  stashes,
  playerPins,
  inventoryItems,
  itemDefinitions,
  activeConsumableEffects,
  worldState,
  localPlayerId,
  connection,
  activeEquipments,
  activeConnections,
  placementInfo,
  placementActions,
  placementError,
  onSetInteractingWith,
  updatePlayerPosition,
  callJumpReducer: jump,
  callSetSprintingReducer: setSprinting,
  isMinimapOpen,
  setIsMinimapOpen,
  isChatting,
  messages,
  isSearchingCraftRecipes,
  showInventory,
  grass,
  gameCanvasRef,
  projectiles,
  deathMarkers,
}) => {
 // console.log('[GameCanvas IS RUNNING] showInventory:', showInventory);

  // console.log("Cloud data in GameCanvas:", Array.from(clouds?.values() || []));

  // --- Refs ---
  const lastPositionsRef = useRef<Map<string, {x: number, y: number}>>(new Map());
  const placementActionsRef = useRef(placementActions);
  const prevPlayerHealthRef = useRef<number | undefined>(undefined);
  const [damagingCampfireIds, setDamagingCampfireIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    placementActionsRef.current = placementActions;
  }, [placementActions]);

  // --- Core Game State Hooks ---
  const localPlayer = useMemo(() => {
    if (!localPlayerId) return undefined;
    return players.get(localPlayerId);
  }, [players, localPlayerId]);

  const { canvasSize, cameraOffsetX, cameraOffsetY } = useGameViewport(localPlayer);
  const { heroImageRef, grassImageRef, itemImagesRef, cloudImagesRef } = useAssetLoader();
  const { worldMousePos, canvasMousePos } = useMousePosition({ canvasRef: gameCanvasRef, cameraOffsetX, cameraOffsetY, canvasSize });

  // Lift deathMarkerImg definition here
  const deathMarkerImg = useMemo(() => itemImagesRef.current?.get('death_marker.png'), [itemImagesRef]);

  const { overlayRgba, maskCanvasRef } = useDayNightCycle({ 
    worldState, 
    campfires, 
    players, // Pass all players
    activeEquipments, // Pass all active equipments
    itemDefinitions, // Pass all item definitions
    cameraOffsetX, 
    cameraOffsetY, 
    canvasSize 
  });
  const {
    closestInteractableMushroomId,
    closestInteractableCornId,
    closestInteractablePumpkinId,
    closestInteractableHempId,
    closestInteractableCampfireId,
    closestInteractableDroppedItemId,
    closestInteractableBoxId,
    isClosestInteractableBoxEmpty,
    closestInteractableCorpseId,
    closestInteractableStashId,
    closestInteractableSleepingBagId,
    closestInteractableKnockedOutPlayerId,
  } = useInteractionFinder({
    localPlayer,
    mushrooms,
    corns,
    pumpkins,
    hemps,
    campfires,
    droppedItems,
    woodenStorageBoxes,
    playerCorpses,
    stashes,
    sleepingBags,
    players,
  });
  const animationFrame = useWalkingAnimationCycle(120); // Faster, smoother walking animation
  const { 
    interactionProgress, 
    isActivelyHolding,
    processInputsAndActions,
    currentJumpOffsetY
  } = useInputHandler({
      canvasRef: gameCanvasRef, connection, localPlayerId, localPlayer: localPlayer ?? null,
      activeEquipments, itemDefinitions,
      placementInfo, placementActions, worldMousePos,
      closestInteractableMushroomId, closestInteractableCornId, closestInteractablePumpkinId, closestInteractableHempId,
      closestInteractableCampfireId, closestInteractableDroppedItemId,
      closestInteractableBoxId, isClosestInteractableBoxEmpty, 
      woodenStorageBoxes,
      isMinimapOpen, setIsMinimapOpen,
      onSetInteractingWith, isChatting,
      closestInteractableCorpseId,
      closestInteractableStashId,
      stashes,
      isSearchingCraftRecipes,
      isInventoryOpen: showInventory,
      closestInteractableKnockedOutPlayerId,
      players,
  });

  // Use ref instead of state to avoid re-renders every frame
  const deltaTimeRef = useRef<number>(0);
  // Add stable deltaTime state for particle systems
  const [stableDeltaTime, setStableDeltaTime] = useState<number>(16.667);
  
  const interpolatedClouds = useCloudInterpolation({ serverClouds: clouds, deltaTime: deltaTimeRef.current });
  const interpolatedGrass = useGrassInterpolation({ serverGrass: grass, deltaTime: deltaTimeRef.current });

  // --- Use Entity Filtering Hook ---
  const {
    visibleSleepingBags,
    visibleMushrooms,
    visibleCorns,
    visiblePumpkins,
    visibleHemps,
    visibleDroppedItems,
    visibleCampfires,
    visibleMushroomsMap,
    visibleCampfiresMap,
    visibleDroppedItemsMap,
    visibleBoxesMap,
    visibleCornsMap,
    visiblePumpkinsMap,
    visibleHempsMap,
    visiblePlayerCorpses,
    visibleStashes,
    visiblePlayerCorpsesMap,
    visibleStashesMap,
    visibleSleepingBagsMap,
    visibleTrees,
    visibleTreesMap,
    ySortedEntities,
    visibleGrass,
    visibleGrassMap
  } = useEntityFiltering(
    players,
    trees,
    stones,
    campfires,
    mushrooms,
    corns,
    pumpkins,
    hemps,
    droppedItems,
    woodenStorageBoxes,
    sleepingBags,
    playerCorpses,
    stashes,
    cameraOffsetX,
    cameraOffsetY,
    canvasSize.width,
    canvasSize.height,
    interpolatedGrass, // Ensure this is the 18th argument
    projectiles // Add projectiles as the 19th argument
  );

  // --- UI State ---
  const { hoveredPlayerIds, handlePlayerHover } = usePlayerHover();

  // --- Use the new Minimap Interaction Hook ---
  const { minimapZoom, isMouseOverMinimap, localPlayerPin, viewCenterOffset } = useMinimapInteraction({
      canvasRef: gameCanvasRef,
      isMinimapOpen,
      connection,
      localPlayer,
      playerPins,
      localPlayerId,
      canvasSize,
  });

  // --- Should show death screen ---
  // Show death screen only based on isDead flag now
  const shouldShowDeathScreen = !!(localPlayer?.isDead && connection);
  
  // Set cursor style based on placement
  const cursorStyle = placementInfo ? 'cell' : 'crosshair';

  // --- Effects ---
  useEffect(() => {
    // Iterate over all known icons in itemIconUtils.ts to ensure they are preloaded
    Object.entries(itemIcons).forEach(([assetName, iconSrc]) => {
      // Ensure iconSrc is a string (path) and not already loaded
      if (iconSrc && typeof iconSrc === 'string' && !itemImagesRef.current.has(assetName)) {
        const img = new Image();
        img.src = iconSrc; // iconSrc is the imported image path
        img.onload = () => {
          itemImagesRef.current.set(assetName, img); // Store with assetName as key
        };
        img.onerror = () => console.error(`Failed to preload item image asset: ${assetName} (Source: ${iconSrc})`);
      }
    });
  }, [itemImagesRef]); // itemIcons is effectively constant from import, so run once on mount based on itemImagesRef

  // Use the particle hooks - but store results in refs to avoid re-render cascades
  const latestCampfireParticles = useCampfireParticles({
    visibleCampfiresMap,
    deltaTime: stableDeltaTime,
  });
  const latestTorchParticles = useTorchParticles({
    players,
    activeEquipments,
    itemDefinitions,
    deltaTime: stableDeltaTime,
  });

  // Store particles in refs to decouple from render cycle
  const campfireParticlesRef = useRef<Particle[]>([]);
  const torchParticlesRef = useRef<Particle[]>([]);
  
  // Update particle refs without causing re-renders
  campfireParticlesRef.current = latestCampfireParticles;
  torchParticlesRef.current = latestTorchParticles;

  // New function to render particles
  const renderParticlesToCanvas = useCallback((ctx: CanvasRenderingContext2D, particlesToRender: Particle[]) => {
    if (!particlesToRender.length) return;

    particlesToRender.forEach(p => {
        // Use p.x and p.y directly as ctx is already translated by camera offsets
        const screenX = Math.floor(p.x); 
        const screenY = Math.floor(p.y); 
        const size = Math.max(1, Math.floor(p.size)); 

        // --- ADDED: Debugging for smoke burst particles ---
        if (p.type === 'smoke' && p.color === "#000000") { // Check if it's a black smoke burst particle
            // console.log(`[RenderParticles] Rendering SMOKE BURST particle: ID=${p.id}, X=${screenX}, Y=${screenY}, Size=${size}, Alpha=${p.alpha}, Color=${p.color}`);
        }
        // --- END ADDED ---

        ctx.globalAlpha = p.alpha;

        if (p.type === 'fire' && p.color) {
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX - Math.floor(size / 2), screenY - Math.floor(size / 2), size, size);
        } else if (p.type === 'smoke') {
            // Regular smoke still uses the default light grey
            ctx.fillStyle = `rgba(160, 160, 160, 1)`; 
            ctx.fillRect(screenX - Math.floor(size / 2), screenY - Math.floor(size / 2), size, size);
        } else if (p.type === 'smoke_burst' && p.color) { // MODIFIED: Added condition for 'smoke_burst'
            ctx.fillStyle = p.color; // This will be black (#000000)
            ctx.fillRect(screenX - Math.floor(size / 2), screenY - Math.floor(size / 2), size, size);
        }
    });
    ctx.globalAlpha = 1.0; 
  }, []);

  const renderGame = useCallback(() => {
    const canvas = gameCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now_ms = Date.now();
    const currentWorldMouseX = worldMousePos.x;
    const currentWorldMouseY = worldMousePos.y;
    const currentCanvasWidth = canvasSize.width;
    const currentCanvasHeight = canvasSize.height;
    
    // Get current cycle progress for dynamic shadows
    // Default to "noonish" (0.375) if worldState or cycleProgress is not yet available.
    const currentCycleProgress = worldState?.cycleProgress ?? 0.375;

    // --- ADD THESE LOGS for basic renderGame entry check ---
    // console.log(
    //     `[GameCanvas renderGame ENTRY] localPlayerId: ${localPlayerId}, ` +
    //     `playerCorpses type: ${typeof playerCorpses}, isMap: ${playerCorpses instanceof Map}, size: ${playerCorpses?.size}, ` +
    //     `localPlayer defined: ${!!localPlayer}, localPlayer.identity defined: ${!!localPlayer?.identity}`
    // );
    // --- END ADDED LOGS ---

    // --- Rendering ---
    ctx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);
    ctx.fillStyle = '#000000'; // Should be black if no background, or ensure background draws over this
    ctx.fillRect(0, 0, currentCanvasWidth, currentCanvasHeight);

    ctx.save();
    ctx.translate(cameraOffsetX, cameraOffsetY);
    // Pass the necessary viewport parameters to the optimized background renderer
    renderWorldBackground(ctx, grassImageRef, cameraOffsetX, cameraOffsetY, currentCanvasWidth, currentCanvasHeight);

    let isPlacementTooFar = false;
    if (placementInfo && localPlayer && currentWorldMouseX !== null && currentWorldMouseY !== null) {
         const placeDistSq = (currentWorldMouseX - localPlayer.positionX)**2 + (currentWorldMouseY - localPlayer.positionY)**2;
         const clientPlacementRangeSq = PLAYER_BOX_INTERACTION_DISTANCE_SQUARED * 1.1;
         if (placeDistSq > clientPlacementRangeSq) {
             isPlacementTooFar = true;
         }
    }

    // --- Render Ground Items Individually --- 

    // First pass: Draw ONLY shadows for ground items that have custom shadows
    // Render Campfire Shadows
    visibleCampfires.forEach(campfire => {
        renderCampfire(ctx, campfire, now_ms, currentCycleProgress, true /* onlyDrawShadow */);
    });
    // Render Pumpkin Shadows
    visiblePumpkins.forEach(pumpkin => {
        renderPumpkin(ctx, pumpkin, now_ms, currentCycleProgress, true /* onlyDrawShadow */);
    });
    // Render Mushroom Shadows - RE-ADDED
    visibleMushrooms.forEach(mushroom => {
        renderMushroom(ctx, mushroom, now_ms, currentCycleProgress, true /* onlyDrawShadow */);
    });
    // --- BEGIN ADDED: Render Tree Shadows ---
    if (visibleTrees) {
      visibleTrees.forEach(tree => {
        renderTree(ctx, tree, now_ms, currentCycleProgress, true /* onlyDrawShadow */);
      });
    }
    // --- END ADDED: Render Tree Shadows ---
    // TODO: Add other ground items like mushrooms, crops here if they get custom dynamic shadows

    // --- Render Clouds on Canvas --- (MOVED HERE)
    // Clouds are rendered after all world entities and particles,
    // but before world-anchored UI like labels.
    // The context (ctx) should still be translated by cameraOffset at this point.
    /* REMOVING THIS FIRST CALL TO RENDER CLOUDS
    if (clouds && clouds.size > 0 && cloudImagesRef.current) {
      renderCloudsDirectly({ 
        ctx, 
        clouds: interpolatedClouds,
        cloudImages: cloudImagesRef.current,
        worldScale: 1, // Use a scale of 1 for clouds
        cameraOffsetX, // Pass camera offsets so clouds move with the world view
        cameraOffsetY  
      });
    }
    */
    // --- End Render Clouds on Canvas ---

    // Second pass: Draw the actual entities for ground items
    // Render Campfires (actual image, skip shadow as it's already drawn if burning)
    /*visibleCampfires.forEach(campfire => {
        renderCampfire(ctx, campfire, now_ms, currentCycleProgress, false, !campfire.isBurning );
    });*/
    // Render Dropped Items
    visibleDroppedItems.forEach(item => {
        const itemDef = itemDefinitions.get(item.itemDefId.toString());
        renderDroppedItem({ ctx, item, itemDef, nowMs: now_ms, cycleProgress: currentCycleProgress }); 
    });
    // Render Mushrooms
    /*visibleMushrooms.forEach(mushroom => {
        renderMushroom(ctx, mushroom, now_ms, currentCycleProgress, false, true);
    });*/
    // Render Corn - Already removed
    // Render Pumpkins
    /*visiblePumpkins.forEach(pumpkin => {
        renderPumpkin(ctx, pumpkin, now_ms, currentCycleProgress, false, true );
    });*/
    // Render Hemp - Already removed
    // Render Sleeping Bags
    visibleSleepingBags.forEach(sleepingBag => {
        renderSleepingBag(ctx, sleepingBag, now_ms, currentCycleProgress);
    });
    // Render Stashes (Remove direct rendering as it's now y-sorted)
    /*visibleStashes.forEach(stash => {
        renderStash(ctx, stash, now_ms, currentCycleProgress);
    });*/
    // --- End Ground Items --- 

    // --- Render Y-Sorted Entities --- (Keep this logic)
    // CORRECTED: Call renderYSortedEntities once, not in a loop
    renderYSortedEntities({
        ctx,
        ySortedEntities,
        heroImageRef,
        lastPositionsRef,
        activeConnections,
        activeEquipments,
        activeConsumableEffects,
        itemDefinitions,
        inventoryItems,
        itemImagesRef,
        worldMouseX: currentWorldMouseX,
        worldMouseY: currentWorldMouseY,
        localPlayerId: localPlayerId,
        animationFrame,
        nowMs: now_ms,
        hoveredPlayerIds,
        onPlayerHover: handlePlayerHover,
        cycleProgress: currentCycleProgress,
        renderPlayerCorpse: (props) => renderPlayerCorpse({...props, cycleProgress: currentCycleProgress, heroImageRef: heroImageRef })
    });
    // --- End Y-Sorted Entities ---

    // Render campfire particles here, after other world entities but before labels/UI
    if (ctx) { // Ensure context is still valid
        // Call without camera offsets, as ctx is already translated
        renderParticlesToCanvas(ctx, campfireParticlesRef.current);
        renderParticlesToCanvas(ctx, torchParticlesRef.current);

        // Render cut grass effects
        renderCutGrassEffects(ctx, now_ms);
    }

    renderInteractionLabels({
        ctx,
        mushrooms: visibleMushroomsMap,
        corns: visibleCornsMap,
        pumpkins: visiblePumpkinsMap,
        hemps: visibleHempsMap,
        campfires: visibleCampfiresMap,
        droppedItems: visibleDroppedItemsMap,
        woodenStorageBoxes: visibleBoxesMap,
        playerCorpses: visiblePlayerCorpsesMap,
        stashes: stashes,
        sleepingBags: visibleSleepingBagsMap,
        players: players,
        itemDefinitions,
        closestInteractableMushroomId, 
        closestInteractableCornId, 
        closestInteractablePumpkinId,
        closestInteractableHempId,
        closestInteractableCampfireId,
        closestInteractableDroppedItemId, 
        closestInteractableBoxId, 
        isClosestInteractableBoxEmpty,
        closestInteractableCorpseId,
        closestInteractableStashId,
        closestInteractableSleepingBagId,
        closestInteractableKnockedOutPlayerId,
    });
    renderPlacementPreview({
        ctx, placementInfo, itemImagesRef, worldMouseX: currentWorldMouseX,
        worldMouseY: currentWorldMouseY, isPlacementTooFar, placementError,
    });

    // --- Render Clouds on Canvas --- (NEW POSITION)
    // Clouds are rendered after all other world-anchored entities and UI,
    // so they appear on top of everything in the world space.
    if (clouds && clouds.size > 0 && cloudImagesRef.current) {
      renderCloudsDirectly({
        ctx,
        clouds: interpolatedClouds,
        cloudImages: cloudImagesRef.current,
        worldScale: 1,
        cameraOffsetX, 
        cameraOffsetY
      });
    }
    // --- End Render Clouds on Canvas ---

    ctx.restore(); // This is the restore from translate(cameraOffsetX, cameraOffsetY)

    // --- Post-Processing (Day/Night, Indicators, Lights, Minimap) ---
    // Day/Night mask overlay
    if (overlayRgba !== 'transparent' && overlayRgba !== 'rgba(0,0,0,0.00)' && maskCanvas) {
         ctx.drawImage(maskCanvas, 0, 0);
    }

    // Interaction indicators - Draw only for visible entities that are interactable
    const drawIndicatorIfNeeded = (entityType: 'campfire' | 'wooden_storage_box' | 'stash' | 'player_corpse' | 'knocked_out_player', entityId: number | bigint | string, entityPosX: number, entityPosY: number, entityHeight: number, isInView: boolean) => {
        // If interactionProgress is null (meaning no interaction is even being tracked by the state object),
        // or if the entity is not in view, do nothing.
        if (!isInView || !interactionProgress) {
            return;
        }
        
        let targetId: number | bigint | string;
        if (typeof entityId === 'string') {
            targetId = entityId; // For knocked out players (hex string)
        } else if (typeof entityId === 'bigint') {
            targetId = BigInt(interactionProgress.targetId ?? 0);
        } else {
            targetId = Number(interactionProgress.targetId ?? 0);
        }

        // Check if the current entity being processed is the target of the (potentially stale) interactionProgress object.
        if (interactionProgress.targetType === entityType && targetId === entityId) {
            
            // IMPORTANT: Only draw the indicator if the hold is *currently active* (isActivelyHolding is true).
            // If isActivelyHolding is false, it means the hold was just released/cancelled.
            // In this case, we don't draw anything for this entity, not even the background circle.
            // The indicator will completely disappear once interactionProgress becomes null in the next state update.
            if (isActivelyHolding) {
                // Use appropriate duration based on interaction type
                const interactionDuration = entityType === 'knocked_out_player' ? REVIVE_HOLD_DURATION_MS : HOLD_INTERACTION_DURATION_MS;
                const currentProgress = Math.min(Math.max((Date.now() - interactionProgress.startTime) / interactionDuration, 0), 1);
                drawInteractionIndicator(
                    ctx,
                    entityPosX + cameraOffsetX,
                    entityPosY + cameraOffsetY - (entityHeight / 2) - 15,
                    currentProgress
                );
            }
        }
    };

    // Iterate through visible entities MAPS for indicators
    visibleCampfiresMap.forEach((fire: SpacetimeDBCampfire) => { 
      drawIndicatorIfNeeded('campfire', fire.id, fire.posX, fire.posY, CAMPFIRE_HEIGHT, true); 
    });
    
    visibleBoxesMap.forEach((box: SpacetimeDBWoodenStorageBox) => { 
      // For boxes, the indicator is only relevant if a hold action is in progress (e.g., picking up an empty box)
      if (interactionProgress && interactionProgress.targetId === box.id && interactionProgress.targetType === 'wooden_storage_box') { 
        drawIndicatorIfNeeded('wooden_storage_box', box.id, box.posX, box.posY, BOX_HEIGHT, true); 
      } 
    });

    // Corrected: Iterate over the full 'stashes' map for drawing indicators for stashes
    // The 'isInView' check within drawIndicatorIfNeeded can be enhanced if needed,
    // but for interaction progress, if it's the target, we likely want to show it if player is close.
    if (stashes instanceof Map) { // Ensure stashes is a Map
        stashes.forEach((stash: SpacetimeDBStash) => {
            // Check if this stash is the one currently being interacted with for a hold action
            if (interactionProgress && interactionProgress.targetId === stash.id && interactionProgress.targetType === 'stash') {
                // For a hidden stash being surfaced, we want to draw the indicator.
                // The 'true' for isInView might need refinement if stashes can be off-screen 
                // but still the closest interactable (though unlikely for a hold interaction).
                // For now, assume if it's the interaction target, it's relevant to draw the indicator.
                drawIndicatorIfNeeded('stash', stash.id, stash.posX, stash.posY, STASH_HEIGHT, true); 
            }
        });
    }

    // Knocked Out Player Indicators
    if (closestInteractableKnockedOutPlayerId && players instanceof Map) {
        const knockedOutPlayer = players.get(closestInteractableKnockedOutPlayerId);
        if (knockedOutPlayer && knockedOutPlayer.isKnockedOut && !knockedOutPlayer.isDead) {
            // Check if this knocked out player is the one currently being revived
            if (interactionProgress && interactionProgress.targetId === closestInteractableKnockedOutPlayerId && interactionProgress.targetType === 'knocked_out_player') {
                const playerHeight = 48; // Approximate player sprite height
                drawIndicatorIfNeeded('knocked_out_player', closestInteractableKnockedOutPlayerId, knockedOutPlayer.positionX, knockedOutPlayer.positionY, playerHeight, true);
            }
        }
    }

    // Campfire Lights - Only draw for visible campfires
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    visibleCampfiresMap.forEach((fire: SpacetimeDBCampfire) => {
      renderCampfireLight({
        ctx,
        campfire: fire,
        cameraOffsetX,
        cameraOffsetY,
      });
    });

    // --- Render Torch Light for ALL players (Local and Remote) ---
    players.forEach(player => {
      renderPlayerTorchLight({
        ctx,
        player,
        activeEquipments,
        itemDefinitions,
        cameraOffsetX,
        cameraOffsetY,
      });
    });
    // --- End Torch Light ---

    ctx.restore();

    // Re-added Minimap drawing call
    if (isMinimapOpen) {
        // Ensure props are valid Maps before passing
        const validPlayers = players instanceof Map ? players : new Map();
        const validTrees = trees instanceof Map ? trees : new Map();
        const validStones = stones instanceof Map ? stones : new Map();
        const validSleepingBags = sleepingBags instanceof Map ? sleepingBags : new Map();
        const validCampfires = campfires instanceof Map ? campfires : new Map();

        drawMinimapOntoCanvas({
            ctx: ctx!,
            players: validPlayers, 
            trees: validTrees, 
            stones: validStones, 
            campfires: validCampfires,
            sleepingBags: validSleepingBags,
            localPlayer,
            localPlayerId,
            viewCenterOffset,
            playerPin: localPlayerPin,
            canvasWidth: currentCanvasWidth, 
            canvasHeight: currentCanvasHeight, 
            isMouseOverMinimap,
            zoomLevel: minimapZoom,
            sleepingBagImage: itemImagesRef.current?.get('sleeping_bag.png'),
            localPlayerDeathMarker: localPlayerDeathMarker,
            deathMarkerImage: deathMarkerImg,
            worldState: worldState,
        });
    }

  }, [
      // Dependencies
      visibleMushrooms, visibleCorns, visiblePumpkins, visibleDroppedItems, visibleCampfires, visibleSleepingBags,
      ySortedEntities, visibleMushroomsMap, visibleCornsMap, visiblePumpkinsMap, visibleCampfiresMap, visibleDroppedItemsMap, visibleBoxesMap,
      players, itemDefinitions, inventoryItems, trees, stones, 
      worldState, localPlayerId, localPlayer, activeEquipments, localPlayerPin, viewCenterOffset,
      itemImagesRef, heroImageRef, grassImageRef, cloudImagesRef, cameraOffsetX, cameraOffsetY,
      canvasSize.width, canvasSize.height, worldMousePos.x, worldMousePos.y,
      animationFrame, placementInfo, placementError, overlayRgba, maskCanvasRef,
      closestInteractableMushroomId, closestInteractableCornId, closestInteractablePumpkinId, closestInteractableCampfireId,
      closestInteractableDroppedItemId, closestInteractableBoxId, isClosestInteractableBoxEmpty,
      interactionProgress, hoveredPlayerIds, handlePlayerHover, messages,
      isMinimapOpen, isMouseOverMinimap, minimapZoom,
      activeConnections,
      activeConsumableEffects,
      visiblePlayerCorpses,
      visibleStashes,
      visibleSleepingBags,
      interpolatedClouds,
      isSearchingCraftRecipes,
      worldState?.cycleProgress, // Correct dependency for renderGame
      visibleTrees, // Added to dependency array
      visibleTreesMap, // Added to dependency array
      playerCorpses,
      showInventory,
      gameCanvasRef,
      projectiles,
      deathMarkerImg,
  ]);

  const gameLoopCallback = useCallback((frameInfo: FrameInfo) => {
    // Update deltaTime ref directly to avoid re-renders
    deltaTimeRef.current = frameInfo.deltaTime;
    
    // Update stable deltaTime for particle systems less frequently to avoid render storms
    if (frameInfo.deltaTime > 0 && frameInfo.deltaTime < 100) { // Reasonable deltaTime range
      setStableDeltaTime(frameInfo.deltaTime);
    }

    processInputsAndActions(); 
    renderGame(); 
  }, [processInputsAndActions, renderGame]);

  // Use the updated hook with optimized performance settings
  useGameLoop(gameLoopCallback, {
    targetFPS: 60,
    maxFrameTime: 33, // More lenient threshold to reduce console spam
    enableProfiling: false // Disable profiling in production for maximum performance
  });

  // Convert sleepingBags map key from string to number for DeathScreen
  const sleepingBagsById = useMemo(() => {
    const mapById = new Map<number, SpacetimeDBSleepingBag>();
    if (sleepingBags instanceof Map) {
        sleepingBags.forEach(bag => {
            mapById.set(bag.id, bag);
        });
    }
    return mapById;
  }, [sleepingBags]);

  // Calculate the viewport bounds needed by useSpacetimeTables
  const worldViewport = useMemo(() => {
    // Return null if canvas size is zero to avoid issues
    if (canvasSize.width === 0 || canvasSize.height === 0) {
      return null;
    }
    return {
      minX: -cameraOffsetX,
      minY: -cameraOffsetY,
      maxX: -cameraOffsetX + canvasSize.width,
      maxY: -cameraOffsetY + canvasSize.height,
    };
  }, [cameraOffsetX, cameraOffsetY, canvasSize.width, canvasSize.height]);

  // Call useSpacetimeTables (replacing the previous faulty call)
  // Ignore return values for now using placeholder {}
  const spacetimeTableHookStates = useSpacetimeTables({ 
      connection, 
      cancelPlacement: placementActions.cancelPlacement,
      viewport: worldViewport, // Pass calculated viewport (can be null)
  });

  // CORRECTLY DERIVE localPlayerDeathMarker from the deathMarkers prop
  const localPlayerDeathMarker = useMemo(() => {
    console.log('[GameCanvas] Computing localPlayerDeathMarker. localPlayer:', localPlayer?.identity?.toHexString(), 'deathMarkers size:', deathMarkers?.size, 'all markers:', Array.from(deathMarkers?.keys() || []));
    if (localPlayer && localPlayer.identity && deathMarkers) {
      const marker = deathMarkers.get(localPlayer.identity.toHexString());
      console.log('[GameCanvas] Found death marker for player:', marker);
      return marker || null;
    }
    return null;
  }, [localPlayer, deathMarkers]);

  // --- Logic to detect player damage from campfires and trigger effects ---
  useEffect(() => {
    if (localPlayer && visibleCampfiresMap) {
      const currentHealth = localPlayer.health;
      const prevHealth = prevPlayerHealthRef.current;

      if (prevHealth !== undefined) { // Only proceed if prevHealth is initialized
        if (currentHealth < prevHealth) { // Health decreased
          const newlyDamagingIds = new Set<string>();
          visibleCampfiresMap.forEach((campfire, id) => {
            if (campfire.isBurning && !campfire.isDestroyed) {
              const dx = localPlayer.positionX - campfire.posX;
              const effectiveCampfireY = campfire.posY - SERVER_CAMPFIRE_DAMAGE_CENTER_Y_OFFSET;
              const dy = localPlayer.positionY - effectiveCampfireY;
              const distSq = dx * dx + dy * dy;
              const damageRadiusSq = SERVER_CAMPFIRE_DAMAGE_RADIUS * SERVER_CAMPFIRE_DAMAGE_RADIUS;

              if (distSq < damageRadiusSq) {
                newlyDamagingIds.add(id.toString());
                // console.log(`[GameCanvas] Player took damage near burning campfire ${id}. Health: ${prevHealth} -> ${currentHealth}`);
              }
            }
          });
          // Set the IDs if any were found, otherwise, this will be an empty set if health decreased but not by a known campfire.
          setDamagingCampfireIds(newlyDamagingIds); 
        } else { 
          // Health did not decrease (or increased / stayed same). Clear any damaging IDs from previous tick.
          if (damagingCampfireIds.size > 0) {
            setDamagingCampfireIds(new Set());
          }
        }
      }
      prevPlayerHealthRef.current = currentHealth; // Always update prevHealth
    } else {
      // No localPlayer or no visibleCampfiresMap
      if (damagingCampfireIds.size > 0) { // Clear if there are lingering IDs
        setDamagingCampfireIds(new Set());
      }
      if (!localPlayer) { // If player becomes null (e.g. disconnect), reset prevHealth
        prevPlayerHealthRef.current = undefined;
      }
    }
  }, [localPlayer, visibleCampfiresMap]); // Dependencies: localPlayer (for health) and campfires map
  // Note: damagingCampfireIds is NOT in this dependency array. We set it, we don't react to its changes here.

  return (
    <div style={{ position: 'relative', width: canvasSize.width, height: canvasSize.height, overflow: 'hidden' }}>
      <canvas
        ref={gameCanvasRef}
        id="game-canvas"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: 'absolute', left: 0, top: 0, cursor: cursorStyle }}
        onContextMenu={(e) => {
            if (placementInfo) {
                 e.preventDefault();
            }
        }}
      />
      
      {shouldShowDeathScreen && (
        <DeathScreen
          // Remove respawnAt prop, add others later
          // respawnAt={respawnTimestampMs}
          // onRespawn={handleRespawnRequest} // We'll wire new callbacks later
          onRespawnRandomly={() => { console.log("Respawn Randomly Clicked"); connection?.reducers?.respawnRandomly(); }}
          onRespawnAtBag={(bagId) => { console.log("Respawn At Bag Clicked:", bagId); connection?.reducers?.respawnAtSleepingBag(bagId); }}
          localPlayerIdentity={localPlayerId ?? null}
          sleepingBags={sleepingBagsById} // Pass converted map
          // Pass other required props for minimap rendering within death screen
          players={players}
          trees={trees}
          stones={stones}
          campfires={campfires}
          playerPin={localPlayerPin}
          sleepingBagImage={itemImagesRef.current?.get('sleeping_bag.png')}
          // Pass the identified corpse and its image for the death screen minimap
          localPlayerDeathMarker={localPlayerDeathMarker}
          deathMarkerImage={deathMarkerImg}
          worldState={worldState}
        />
      )}
    </div>
  );
};

export default React.memo(GameCanvas);