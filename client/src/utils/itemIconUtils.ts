// client/src/utils/itemIconUtils.ts

// Import default/error icon
import errorIcon from '../assets/items/error.png'; // Adjust path if needed

// Import all potential item icons
import woodIcon from '../assets/items/wood.png';
import stoneIcon from '../assets/items/stone.png';
import woodHatchetIcon from '../assets/items/wood_hatchet.png';
import pickAxeIcon from '../assets/items/pick_axe.png';
import campFireIcon from '../assets/items/campfire.png';
import rockItemIcon from '../assets/items/rock_item.png';
import clothShirtIcon from '../assets/items/cloth_shirt.png';
import clothPantsIcon from '../assets/items/cloth_pants.png';
import clothHatIcon from '../assets/items/cloth_hood.png';
import clothGlovesIcon from '../assets/items/cloth_gloves.png';
import clothBootsIcon from '../assets/items/cloth_boots.png';
import burlapSackIcon from '../assets/items/burlap_sack.png';
import burlapBackpackIcon from '../assets/items/burlap_backpack.png';
import mushroomIcon from '../assets/items/mushroom.png';
import woodenStorageBoxIcon from '../assets/items/wooden_storage_box.png';

// We don't import the missing ones (hood, boots, etc.)

// Create a mapping from the asset name (stored in DB) to the imported module path
// Use a Proxy or a function to handle fallbacks gracefully
const iconMap: { [key: string]: string | undefined } = {
  'wood.png': woodIcon,
  'stone.png': stoneIcon,
  'wood_hatchet.png': woodHatchetIcon,
  'pick_axe.png': pickAxeIcon,
  'campfire.png': campFireIcon,
  'rock_item.png': rockItemIcon,
  'cloth_shirt.png': clothShirtIcon,
  'cloth_pants.png': clothPantsIcon,
  'cloth_hood.png': clothHatIcon,
  'cloth_gloves.png': clothGlovesIcon,
  'cloth_boots.png': clothBootsIcon,
  'burlap_sack.png': burlapSackIcon,
  'burlap_backpack.png': burlapBackpackIcon,
  'mushroom.png': mushroomIcon,
  'wooden_storage_box.png': woodenStorageBoxIcon,
  // Add mappings for existing icons only
};

// Export a function that provides the fallback logic
export function getItemIcon(assetName: string | undefined | null): string {
    if (!assetName) {
        return errorIcon; // Return error icon if assetName is missing
    }
    return iconMap[assetName] || errorIcon; // Return mapped icon or error icon
}

// Keep the itemIcons map export if it's used elsewhere, but prefer getItemIcon
export const itemIcons = iconMap; // Deprecate direct use of this?

// Deprecate this function? getItemIcon replaces it.
// export function getItemIconPath(assetName: string): string | undefined {
//   return itemIcons[assetName];
// } 