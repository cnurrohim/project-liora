type Role = {
  id: string;
  name: string;
};

type DefaultRole = {
  id: string;
  name: string;
} | null;

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_photo: string | null;
  phone_number: string | null;
  address: string | null;
  roles: Role[];
  defaultRole: DefaultRole;
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

export const UserProfileController = {
  setState(partial: Partial<ProfileState>) {
    state = { ...state, ...partial };
    notify();
  },

  getState() {
    return state;
  },

  subscribe(cb: () => void) {
    listeners.push(cb);
    return () => {
      this.unsubscribe(cb);
    };
  },

  unsubscribe(cb: () => void) {
    listeners = listeners.filter((fn) => fn !== cb);
  },
};

function notify() {
  listeners.forEach((cb) => cb());
}
