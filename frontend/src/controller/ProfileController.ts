// frontend/src/controller/ProfileController.ts
import { getUserProfile } from "@/api/userProfile.api";

type Role = {
  id: string;
  name: string;
};

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_photo: string | null;
  phone_number: string | null;
  address: string | null;
  roles: Role[];
  defaultRole: Role | null;
};

type ProfileState = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
};

let state: ProfileState = {
  user: null,
  loading: false,
  error: null,
};

let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((cb) => cb());
}

export const ProfileController = {
  getState() {
    return state;
  },

  async load() {
    try {
      const profile = await getUserProfile();
      this.setState({ user: profile, loading: false });
      notify();
    } catch (err) {
      console.error("Failed to load profile", err);
      this.setState({
        error: err instanceof Error ? err.message : "Gagal memuat profil",
        loading: false,
      });
    }
  },

  setState(partial: Partial<ProfileState>) {
    state = { ...state, ...partial };
    notify();
  },

  reset() {
    this.setState({ user: null, error: null, loading: false });
  },

  subscribe(cb: () => void) {
    listeners.push(cb);
  },

  unsubscribe(cb: () => void) {
    listeners = listeners.filter((fn) => fn !== cb);
  },
};
