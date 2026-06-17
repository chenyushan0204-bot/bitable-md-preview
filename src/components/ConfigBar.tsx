import { IFieldMeta } from '@lark-base-open/js-sdk';

interface ConfigBarProps {
  fields: IFieldMeta[];
  headerFieldId: string;
  onHeaderFieldChange: (fieldId: string) => void;
}

export default function ConfigBar({ fields, headerFieldId, onHeaderFieldChange }: ConfigBarProps) {
  return (
    <div className="config-bar">
      <label className="config-label" htmlFor="header-field">
        头信息字段
      </label>
      <select
        id="header-field"
        className="config-select"
        value={headerFieldId}
        onChange={(e) => onHeaderFieldChange(e.target.value)}
      >
        <option value="">不显示</option>
        {fields.map((field) => (
          <option key={field.id} value={field.id}>
            {field.name}
          </option>
        ))}
      </select>
    </div>
  );
}
