import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUsersStore } from "./usersStore";
import { createMockPinia } from "../../../test-utils";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";

vi.mock("../api/userApi");

const me = { id: 1, name: "A", email: "a@a.com", photo: null };

describe("usersStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("should load users", async () => {
    getUsers.mockResolvedValue({ success: true, data: { users: [me] } });
    const store = useUsersStore();
    await store.asyncGetUsers();
    expect(store.users).toEqual([me]);
    expect(store.isLoading).toBe(false);
  });

  it("should keep users empty when loading fails", async () => {
    getUsers.mockResolvedValue({ success: false, message: "x" });
    const store = useUsersStore();
    const result = await store.asyncGetUsers();
    expect(result.success).toBe(false);
    expect(store.users).toEqual([]);
  });

  it("should load profile", async () => {
    getMe.mockResolvedValue({ success: true, data: { user: me } });
    const store = useUsersStore();
    await store.asyncGetProfile();
    expect(store.profile).toEqual(me);
    expect(store.user).toEqual(me);
  });

  it("should keep profile null when loading fails", async () => {
    getMe.mockResolvedValue({ success: false });
    const store = useUsersStore();
    await store.asyncGetProfile();
    expect(store.profile).toBeNull();
  });

  it("should change profile and refresh it", async () => {
    putMe.mockResolvedValue({ success: true });
    getMe.mockResolvedValue({ success: true, data: { user: { ...me, name: "B" } } });
    const store = useUsersStore();
    const result = await store.asyncChangeProfile({ name: "B", email: "a@a.com" });
    expect(putMe).toHaveBeenCalledWith({ name: "B", email: "a@a.com" });
    expect(result.success).toBe(true);
    expect(store.profile.name).toBe("B");
    expect(store.isProfileChange).toBe(false);
    expect(store.isProfileChanged).toBe(true);
  });

  it("should not refresh profile when the change fails", async () => {
    putMe.mockResolvedValue({ success: false, message: "gagal" });
    getMe.mockClear();
    const store = useUsersStore();
    await store.asyncChangeProfile({});
    expect(getMe).not.toHaveBeenCalled();
    expect(store.isProfileChanged).toBe(false);
  });

  it("should change photo", async () => {
    postPhoto.mockResolvedValue({ success: true });
    getMe.mockResolvedValue({ success: true, data: { user: me } });
    const file = new File(["x"], "p.png");
    const store = useUsersStore();
    await store.asyncChangePhoto(file);
    expect(postPhoto).toHaveBeenCalledWith(file);
    expect(store.isProfileChanged).toBe(true);
  });

  it("should change password", async () => {
    putPassword.mockResolvedValue({ success: true, message: "ok" });
    const store = useUsersStore();
    const result = await store.asyncChangePassword({ password: "1" });
    expect(putPassword).toHaveBeenCalledWith({ password: "1" });
    expect(result.message).toBe("ok");
    expect(store.isProfileChange).toBe(false);
  });
});
