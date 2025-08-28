// src/core/wiring/menu.wires.ts

import type { Wire } from "./setupWiring";
import { ProfileController } from "@/controller/ProfileController";
import { UserProfileController as VUserProfileController } from "@/components/VerticalMenu/userProfileController";
import { UserProfileController as HUserProfileController } from "@/components/HorizontalMenu/userProfileController";
import { UserProfileController as VEUserProfileController } from "@/components/VerticalMenuExpanded/userProfileController";

export const userProfileWires: Wire[] = [
  {
    from: ProfileController.subscribe,
    to: () => {
      const { user } = ProfileController.getState();
      VUserProfileController.setState({ user });
    },
  },
  {
    from: ProfileController.subscribe,
    to: () => {
      const { user } = ProfileController.getState();
      HUserProfileController.setState({ user });
    },
  },
  {
    from: ProfileController.subscribe,
    to: () => {
      const { user } = ProfileController.getState();
      VEUserProfileController.setState({ user });
    },
  },
];
