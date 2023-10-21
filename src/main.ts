import { Keyboard } from "isaac-typescript-definitions";
import {
  initModFeatures,
  log,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { version } from "../package.json";
import { AchievementNotification } from "./classes/features/AchievementNotification";
import { AchievementRandomizer } from "./classes/features/AchievementRandomizer";
import { AchievementTracker } from "./classes/features/AchievementTracker";
import { BossKillObjectiveDetection } from "./classes/features/BossKillObjectiveDetection";
import { BossNoHitObjectiveDetection } from "./classes/features/BossNoHitObjectiveDetection";
import { ChallengeObjectiveDetection } from "./classes/features/ChallengeObjectiveDetection";
import { CheckErrors } from "./classes/features/CheckErrors";
import { ChillRoom } from "./classes/features/ChillRoom";
import { DrawControls } from "./classes/features/DrawControls";
import { FixVanillaBugs } from "./classes/features/FixVanillaBugs";
import { FloorHitIcon } from "./classes/features/FloorHitIcon";
import { FloorObjectiveDetection } from "./classes/features/FloorObjectiveDetection";
import { ForceFadedConsoleDisplay } from "./classes/features/ForceFadedConsoleDisplay";
import { ForceSeeds } from "./classes/features/ForceSeeds";
import { GridEntityRemoval } from "./classes/features/GridEntityRemoval";
import { InvisibleEntities } from "./classes/features/InvisibleEntities";
import { NPCRemoval } from "./classes/features/NPCRemoval";
import { NightmareMode } from "./classes/features/NightmareMode";
import { PathRemoval } from "./classes/features/PathRemoval";
import { PickupRemoval } from "./classes/features/PickupRemoval";
import { PillRemoval } from "./classes/features/PillRemoval";
import { PreventEndMegaSatan } from "./classes/features/PreventEndMegaSatan";
import { PreventPause } from "./classes/features/PreventPause";
import { PreventSaveAndQuit } from "./classes/features/PreventSaveAndQuit";
import { PreventVictoryLapPopup } from "./classes/features/PreventVictoryLapPopup";
import { RemoveDonationMachines } from "./classes/features/RemoveDonationMachines";
import { RemoveGlitchedCollectibles } from "./classes/features/RemoveGlitchedCollectibles";
import { RemoveVoidPortals } from "./classes/features/RemoveVoidPortals";
import { RoomRemoval } from "./classes/features/RoomRemoval";
import { SilenceMomDad } from "./classes/features/SilenceMomDad";
import { SlotRemoval } from "./classes/features/SlotRemoval";
import { StartingItemRemoval } from "./classes/features/StartingItemRemoval";
import { StartingRoomInfo } from "./classes/features/StartingRoomInfo";
import { StatsTracker } from "./classes/features/StatsTracker";
import { Timer } from "./classes/features/Timer";
import { UIIcon } from "./classes/features/UIIcon";
import { initConsoleCommands } from "./consoleCommands";
import { IS_DEV, MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";
import { debugFunction, hotkey1Function, hotkey2Function } from "./debugCode";
import { mod } from "./mod";

const MOD_FEATURES = [
  AchievementNotification,
  AchievementRandomizer,
  AchievementTracker,
  BossKillObjectiveDetection,
  BossNoHitObjectiveDetection,
  ChallengeObjectiveDetection,
  CheckErrors,
  ChillRoom,
  DrawControls,
  FixVanillaBugs,
  FloorObjectiveDetection,
  FloorHitIcon,
  ForceFadedConsoleDisplay,
  ForceSeeds,
  GridEntityRemoval,
  InvisibleEntities,
  NightmareMode,
  NPCRemoval,
  PathRemoval,
  PickupRemoval,
  PillRemoval,
  PreventEndMegaSatan,
  PreventPause,
  PreventSaveAndQuit,
  PreventVictoryLapPopup,
  RemoveDonationMachines,
  RemoveGlitchedCollectibles,
  RemoveVoidPortals,
  RoomRemoval,
  SilenceMomDad,
  SlotRemoval,
  StartingItemRemoval,
  StartingRoomInfo,
  StatsTracker,
  Timer,
  UIIcon,
] as const;

export function main(): void {
  welcomeBanner();

  if (IS_DEV) {
    setLogFunctionsGlobal();
    setTracebackFunctionsGlobal();
    mod.saveDataManagerSetGlobal();

    mod.enableFastReset();
    mod.removeFadeIn();

    mod.addConsoleCommand("d", debugFunction);
    mod.setHotkey(Keyboard.F3, hotkey1Function);
    mod.setHotkey(Keyboard.F4, hotkey2Function);
  }

  initDeadSeaScrolls();
  initModFeatures(mod, MOD_FEATURES);
  initConsoleCommands();
}

function welcomeBanner() {
  const welcomeText = `${MOD_NAME} ${version} initialized.`;
  const hyphens = "-".repeat(welcomeText.length);
  const welcomeTextBorder = `+-${hyphens}-+`;
  log(welcomeTextBorder);
  log(`| ${welcomeText} |`);
  log(welcomeTextBorder);
}
