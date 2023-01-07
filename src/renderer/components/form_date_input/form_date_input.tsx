import styles from "./form_date_input.module.css";
import { useTranslation } from "react-i18next";

interface IDateInputProps {
  label?: any;
  value?: any;
  onChange?: any;
  onRemove?: any;
}

export default function DateInput({
  label,
  value,
  onChange,
  onRemove,
}: IDateInputProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {label}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={onRemove}
        >
          X
        </button>
        <br />
        <input
          className={styles.input}
          type="date"
          value={value}
          onChange={onChange}
        />
      </label>
    </div>
  );
}