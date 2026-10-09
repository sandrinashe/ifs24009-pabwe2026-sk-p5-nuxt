import { ref, type Ref } from "vue";

/**
 * Composable bertipe untuk mengelola state dan change handler pada input form.
 */
export default function useInput<T extends string | number = string>(
  defaultValue: T = "" as T
): [Ref<T>, (event: Event) => void] {
  const value = ref(defaultValue) as Ref<T>;

  const onChange = (event: Event) => {
    value.value = (event.target as HTMLInputElement).value as T;
  };

  return [value, onChange];
}
