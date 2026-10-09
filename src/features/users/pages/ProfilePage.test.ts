import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  getInitial: (name) => name.charAt(0).toUpperCase(),
}));

const profile = { id: 1, name: "Sandrina", email: "s@a.com", photo: null };

const mountPage = async (loaded = profile) => {
  const pinia = createMockPinia();
  const store = useUsersStore();
  store.asyncGetProfile = vi.fn().mockImplementation(async () => {
    store.profile = loaded;
  });
  store.asyncChangeProfile = vi.fn().mockResolvedValue({ success: true, message: "Berhasil mengubah data" });
  store.asyncChangePhoto = vi.fn().mockResolvedValue({ success: true });
  store.asyncChangePassword = vi.fn().mockResolvedValue({ success: true, message: "Berhasil mengubah kata sandi" });
  const result = await renderWithProviders(ProfilePage, { pinia });
  return { ...result, store };
};

describe("ProfilePage", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should fill the form from the loaded profile and show the initial", async () => {
    const { wrapper } = await mountPage();
    expect(wrapper.find("#name").element.value).toBe("Sandrina");
    expect(wrapper.find("#email").element.value).toBe("s@a.com");
    expect(wrapper.find("[data-testid=profile-initial]").text()).toBe("S");
  });

  it("should show the photo when available", async () => {
    const { wrapper } = await mountPage({ ...profile, photo: "http://x/p.png" });
    expect(wrapper.find("img").attributes("src")).toBe("http://x/p.png");
  });

  it("should show loading text when the profile could not be loaded", async () => {
    const { wrapper } = await mountPage(null);
    expect(wrapper.text()).toContain("Memuat profil");
  });

  it("should submit the profile and show success", async () => {
    const { wrapper, store } = await mountPage();
    await wrapper.find("#name").setValue("Baru");
    await wrapper.find("#email").setValue("baru@a.com");
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(store.asyncChangeProfile).toHaveBeenCalledWith({ name: "Baru", email: "baru@a.com" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
  });

  it("should show an error when the profile change fails", async () => {
    const { wrapper, store } = await mountPage();
    store.asyncChangeProfile.mockResolvedValue({ success: false, message: "Email dipakai" });
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
  });

  it("should upload the selected photo with a default message", async () => {
    const { wrapper, store } = await mountPage();
    const button = wrapper.findAll("form")[1].find("button");
    expect(button.attributes("disabled")).toBeDefined();

    const file = new File(["x"], "p.png", { type: "image/png" });
    const input = wrapper.find("#photo");
    Object.defineProperty(input.element, "files", { value: [file] });
    await input.trigger("change");
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();

    expect(store.asyncChangePhoto).toHaveBeenCalledWith(file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah foto");
  });

  it("should use the server message when uploading the photo", async () => {
    const { wrapper, store } = await mountPage();
    store.asyncChangePhoto.mockResolvedValue({ success: false, message: "File terlalu besar" });
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
  });

  it("should change the password and clear the inputs", async () => {
    const { wrapper, store } = await mountPage();
    await wrapper.find("#password").setValue("lama");
    await wrapper.find("#new-password").setValue("baru123");
    await wrapper.find("#confirmation").setValue("baru123");
    await wrapper.findAll("form")[2].trigger("submit");
    await flushPromises();

    expect(store.asyncChangePassword).toHaveBeenCalledWith({
      password: "lama",
      new_password: "baru123",
      new_password_confirmation: "baru123",
    });
    expect(wrapper.find("#password").element.value).toBe("");
    expect(wrapper.find("#new-password").element.value).toBe("");
    expect(wrapper.find("#confirmation").element.value).toBe("");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah kata sandi");
  });

  it("should keep the inputs when the password change fails", async () => {
    const { wrapper, store } = await mountPage();
    store.asyncChangePassword.mockResolvedValue({ success: false, message: "Password salah" });
    await wrapper.find("#password").setValue("lama");
    await wrapper.findAll("form")[2].trigger("submit");
    await flushPromises();
    expect(wrapper.find("#password").element.value).toBe("lama");
    expect(showErrorDialog).toHaveBeenCalledWith("Password salah");
  });
});
