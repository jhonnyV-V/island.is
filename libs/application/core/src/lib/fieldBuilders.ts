import {
  AlertMessageField,
  Application,
  AsyncSelectField,
  BaseField,
  CallToAction,
  CheckboxField,
  CompanySearchField,
  Condition,
  CustomField,
  DateField,
  DescriptionField,
  DividerField,
  ExpandableDescriptionField,
  Field,
  FieldComponents,
  FieldTypes,
  FieldWidth,
  FileUploadField,
  FormText,
  FormTextArray,
  KeyValueField,
  LinkField,
  MaybeWithApplicationAndField,
  MessageWithLinkButtonField,
  Option,
  PaymentChargeOverviewField,
  PaymentPendingField,
  PdfLinkButtonField,
  PhoneField,
  RadioField,
  RecordObject,
  RedirectToServicePortalField,
  SelectField,
  SubmitField,
  TextField,
  ImageField,
  NationalIdWithNameField,
  ActionCardListField,
  TableRepeaterField,
  StaticTableField,
  HiddenInputWithWatchedValueField,
  HiddenInputField,
  BoxChartField,
} from '@island.is/application/types'

import { Colors } from '@island.is/island-ui/theme'
import { SpanType, BoxProps } from '@island.is/island-ui/core/types'
import { coreDefaultFieldMessages } from './messages'

const extractCommonFields = (
  data: Omit<BaseField, 'type' | 'component' | 'children'>,
) => {
  const {
    condition,
    defaultValue,
    description,
    disabled = false,
    doesNotRequireAnswer = false,
    id,
    title,
    dataTestId,
    width = 'full',
  } = data

  return {
    id,
    condition,
    defaultValue,
    description,
    disabled,
    dataTestId,
    doesNotRequireAnswer,
    title,
    width,
  }
}

export function buildCheckboxField(
  data: Omit<CheckboxField, 'type' | 'component' | 'children'>,
): CheckboxField {
  const {
    options,
    strong = false,
    large = true,
    required,
    backgroundColor = 'blue',
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    large,
    strong,
    backgroundColor,
    options,
    required,
    type: FieldTypes.CHECKBOX,
    component: FieldComponents.CHECKBOX,
  }
}

export function buildDateField(
  data: Omit<DateField, 'type' | 'component' | 'children'>,
): DateField {
  const {
    maxDate,
    minDate,
    excludeDates,
    placeholder,
    backgroundColor = 'blue',
    required,
    readOnly,
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    maxDate,
    minDate,
    excludeDates,
    type: FieldTypes.DATE,
    component: FieldComponents.DATE,
    backgroundColor,
    required,
    readOnly,
  }
}

export function buildDescriptionField(
  data: Omit<DescriptionField, 'type' | 'component' | 'children'>,
): DescriptionField {
  const {
    titleVariant = 'h2',
    description,
    tooltip,
    titleTooltip,
    space,
    marginBottom,
    marginTop,
  } = data
  return {
    ...extractCommonFields(data),
    doesNotRequireAnswer: true,
    children: undefined,
    description,
    titleVariant,
    tooltip,
    titleTooltip,
    space,
    marginBottom,
    marginTop,
    type: FieldTypes.DESCRIPTION,
    component: FieldComponents.DESCRIPTION,
  }
}

export function buildRadioField(
  data: Omit<RadioField, 'type' | 'component' | 'children'>,
): RadioField {
  const {
    options,
    largeButtons = true,
    backgroundColor,
    space,
    required,
  } = data

  return {
    ...extractCommonFields(data),
    children: undefined,
    largeButtons,
    options,
    backgroundColor,
    space,
    required,
    type: FieldTypes.RADIO,
    component: FieldComponents.RADIO,
  }
}

export function buildSelectField(
  data: Omit<SelectField, 'type' | 'component' | 'children'>,
): SelectField {
  const {
    options,
    placeholder,
    onSelect,
    backgroundColor = 'blue',
    required,
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    options,
    required,
    type: FieldTypes.SELECT,
    component: FieldComponents.SELECT,
    onSelect,
    backgroundColor,
  }
}

export function buildAsyncSelectField(
  data: Omit<AsyncSelectField, 'type' | 'component' | 'children'>,
): AsyncSelectField {
  const {
    loadOptions,
    loadingError,
    placeholder,
    onSelect,
    backgroundColor = 'blue',
    isSearchable,
  } = data

  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    loadOptions,
    loadingError,
    type: FieldTypes.ASYNC_SELECT,
    component: FieldComponents.ASYNC_SELECT,
    onSelect,
    backgroundColor,
    isSearchable,
  }
}

export function buildCompanySearchField(
  data: Omit<CompanySearchField, 'type' | 'component' | 'children'>,
): CompanySearchField {
  const {
    placeholder,
    shouldIncludeIsatNumber,
    checkIfEmployerIsOnForbiddenList,
    required,
  } = data

  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    shouldIncludeIsatNumber,
    checkIfEmployerIsOnForbiddenList,
    required,
    type: FieldTypes.COMPANY_SEARCH,
    component: FieldComponents.COMPANY_SEARCH,
  }
}

export function buildTextField(
  data: Omit<TextField, 'type' | 'component' | 'children'>,
): TextField {
  const {
    backgroundColor = 'blue',
    placeholder,
    variant = 'text',
    format,
    suffix,
    rows,
    required,
    maxLength,
    readOnly,
    rightAlign,
    onChange,
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    backgroundColor,
    variant,
    format,
    suffix,
    rows,
    required,
    maxLength,
    readOnly,
    rightAlign,
    onChange,
    type: FieldTypes.TEXT,
    component: FieldComponents.TEXT,
  }
}

export function buildPhoneField(
  data: Omit<PhoneField, 'type' | 'component' | 'children'>,
): PhoneField {
  const {
    backgroundColor = 'blue',
    placeholder,
    required,
    readOnly,
    rightAlign,
    allowedCountryCodes,
    disableDropdown,
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    placeholder,
    backgroundColor,
    required,
    readOnly,
    allowedCountryCodes,
    disableDropdown,
    rightAlign,
    type: FieldTypes.PHONE,
    component: FieldComponents.PHONE,
  }
}

export function buildCustomField(
  data: Omit<CustomField, 'props' | 'type' | 'children'>,
  props?: RecordObject,
): CustomField {
  const { component, childInputIds } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    childInputIds,
    type: FieldTypes.CUSTOM,
    component,
    props: props ?? {},
  }
}

export function buildFileUploadField(
  data: Omit<FileUploadField, 'type' | 'component' | 'children'>,
): FileUploadField {
  const {
    introduction,
    uploadHeader,
    uploadDescription,
    uploadButtonLabel,
    uploadMultiple,
    uploadAccept,
    maxSize,
    maxSizeErrorText,
    forImageUpload,
  } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    introduction: introduction,
    uploadHeader:
      uploadHeader || coreDefaultFieldMessages.defaultFileUploadHeader,
    uploadDescription:
      uploadDescription ||
      coreDefaultFieldMessages.defaultFileUploadDescription,
    uploadButtonLabel:
      uploadButtonLabel ||
      coreDefaultFieldMessages.defaultFileUploadButtonLabel,
    uploadMultiple,
    uploadAccept:
      uploadAccept ?? '.pdf, .doc, .docx, .rtf, .jpg, .jpeg, .png, .heic',
    maxSize: maxSize ?? 10000000,
    maxSizeErrorText,
    forImageUpload,
    type: FieldTypes.FILEUPLOAD,
    component: FieldComponents.FILEUPLOAD,
  }
}

export function buildDividerField(data: {
  condition?: Condition
  title?: FormText
  color?: Colors
}): DividerField {
  const { title, color, condition } = data
  return {
    id: '',
    children: undefined,
    type: FieldTypes.DIVIDER,
    component: FieldComponents.DIVIDER,
    doesNotRequireAnswer: true,
    title: title ?? '',
    color,
    condition,
  }
}

export function buildKeyValueField(data: {
  label: FormText
  value: FormText | FormTextArray
  width?: FieldWidth
  colSpan?: SpanType
  condition?: Condition
  display?: 'block' | 'flex'
  divider?: boolean
  paddingX?: BoxProps['padding']
  paddingY?: BoxProps['padding']
}): KeyValueField {
  const {
    label,
    value,
    condition,
    width = 'full',
    colSpan,
    display = 'block',
    divider = false,
    paddingX,
    paddingY,
  } = data

  return {
    id: '',
    title: '',
    children: undefined,
    doesNotRequireAnswer: true,
    condition,
    width,
    colSpan,
    label,
    value,
    divider,
    type: FieldTypes.KEY_VALUE,
    component: FieldComponents.KEY_VALUE,
    display,
    paddingX,
    paddingY,
  }
}

export function buildSubmitField(data: {
  id: string
  title: FormText
  placement?: 'footer' | 'screen'
  refetchApplicationAfterSubmit?: boolean
  actions: CallToAction[]
}): SubmitField {
  const {
    id,
    placement = 'footer',
    title,
    actions,
    refetchApplicationAfterSubmit,
  } = data
  return {
    children: undefined,
    id,
    title,
    actions,
    placement,
    doesNotRequireAnswer: true,
    refetchApplicationAfterSubmit:
      typeof refetchApplicationAfterSubmit !== 'undefined'
        ? refetchApplicationAfterSubmit
        : false,
    type: FieldTypes.SUBMIT,
    component: FieldComponents.SUBMIT,
  }
}

export function buildFieldOptions(
  maybeOptions: MaybeWithApplicationAndField<Option[]>,
  application: Application,
  field: Field,
): Option[] {
  if (typeof maybeOptions === 'function') {
    return maybeOptions(application, field)
  }

  return maybeOptions
}

export function buildRedirectToServicePortalField(data: {
  id: string
  title: FormText
}): RedirectToServicePortalField {
  const { id, title } = data
  return {
    children: undefined,
    id,
    title,
    type: FieldTypes.REDIRECT_TO_SERVICE_PORTAL,
    component: FieldComponents.REDIRECT_TO_SERVICE_PORTAL,
  }
}

export function buildPaymentPendingField(data: {
  id: string
  title: FormText
}): PaymentPendingField {
  const { id, title } = data
  return {
    children: undefined,
    id,
    title,
    type: FieldTypes.PAYMENT_PENDING,
    component: FieldComponents.PAYMENT_PENDING,
  }
}

export function buildMessageWithLinkButtonField(
  data: Omit<MessageWithLinkButtonField, 'type' | 'component' | 'children'>,
): MessageWithLinkButtonField {
  const { id, title, url, message, buttonTitle, marginBottom, marginTop } = data
  return {
    children: undefined,
    id,
    title,
    url,
    message,
    buttonTitle,
    marginTop,
    marginBottom,
    type: FieldTypes.MESSAGE_WITH_LINK_BUTTON_FIELD,
    component: FieldComponents.MESSAGE_WITH_LINK_BUTTON_FIELD,
  }
}

export function buildExpandableDescriptionField(
  data: Omit<ExpandableDescriptionField, 'type' | 'component' | 'children'>,
): ExpandableDescriptionField {
  const { id, title, description, introText, startExpanded } = data
  return {
    children: undefined,
    id,
    title,
    description,
    introText,
    startExpanded,
    type: FieldTypes.EXPANDABLE_DESCRIPTION,
    component: FieldComponents.EXPANDABLE_DESCRIPTION,
  }
}
export function buildAlertMessageField(
  data: Omit<AlertMessageField, 'type' | 'component' | 'children'>,
): AlertMessageField {
  const { message, alertType, marginTop, marginBottom, links } = data
  return {
    ...extractCommonFields(data),
    children: undefined,
    message,
    alertType,
    type: FieldTypes.ALERT_MESSAGE,
    component: FieldComponents.ALERT_MESSAGE,
    marginTop,
    marginBottom,
    links,
  }
}

export function buildLinkField(
  data: Omit<LinkField, 'type' | 'component' | 'children'>,
): LinkField {
  const { s3key, link, iconProps } = data
  return {
    ...extractCommonFields(data),
    s3key,
    link,
    iconProps,
    children: undefined,
    type: FieldTypes.LINK,
    component: FieldComponents.LINK,
  }
}

export function buildPaymentChargeOverviewField(
  data: Omit<PaymentChargeOverviewField, 'type' | 'component' | 'children'>,
): PaymentChargeOverviewField {
  const { id, title, forPaymentLabel, totalLabel, getSelectedChargeItems } =
    data
  return {
    children: undefined,
    id,
    title,
    forPaymentLabel,
    totalLabel,
    getSelectedChargeItems,
    type: FieldTypes.PAYMENT_CHARGE_OVERVIEW,
    component: FieldComponents.PAYMENT_CHARGE_OVERVIEW,
  }
}

export function buildImageField(
  data: Omit<ImageField, 'type' | 'component' | 'children'>,
): ImageField {
  const {
    id,
    title,
    image,
    alt,
    marginTop,
    marginBottom,
    condition,
    imageWidth = 'full',
    titleVariant = 'h4',
  } = data
  return {
    children: undefined,
    id,
    title,
    image,
    alt,
    imageWidth,
    marginTop,
    marginBottom,
    condition,
    titleVariant,
    type: FieldTypes.IMAGE,
    component: FieldComponents.IMAGE,
  }
}

export function buildPdfLinkButtonField(
  data: Omit<PdfLinkButtonField, 'type' | 'component' | 'children'>,
): PdfLinkButtonField {
  const {
    verificationDescription,
    verificationLinkTitle,
    verificationLinkUrl,
    getPdfFiles,
    setViewPdfFile,
  } = data
  return {
    ...extractCommonFields(data),
    verificationDescription,
    verificationLinkTitle,
    verificationLinkUrl,
    getPdfFiles,
    setViewPdfFile,
    children: undefined,
    type: FieldTypes.PDF_LINK_BUTTON,
    component: FieldComponents.PDF_LINK_BUTTON,
  }
}

/**
 * Constructs a hidden input field configuration object with a watched value.
 * This function is specifically designed for creating hidden input fields that dynamically
 * update their value based on the value of another field specified by `watchValue`.
 *
 * @param {Omit<HiddenInputWithWatchedValueField, 'type' | 'component' | 'children' | 'title'>} data
 * - `id`: Unique identifier for the hidden input field, this will get stored in answers.
 * - `watchValue`: The answer id that this hidden input should watch and update its value accordingly.
 * - `valueModifier`: An optional function to modify the watched value before setting it.
 */
export const buildHiddenInputWithWatchedValue = (
  data: Omit<
    HiddenInputWithWatchedValueField,
    'type' | 'component' | 'children' | 'title'
  >,
): HiddenInputWithWatchedValueField => {
  return {
    ...extractCommonFields({ title: '', ...data }),
    id: data.id,
    type: FieldTypes.HIDDEN_INPUT_WITH_WATCHED_VALUE,
    component: FieldComponents.HIDDEN_INPUT,
    valueModifier: data.valueModifier,
    watchValue: data.watchValue,
    title: '',
    children: undefined,
  }
}

/**
 * Constructs a hidden input field configuration object with a default value.
 * This function creates a configuration for hidden input fields that are initialized
 * with a static or computed default value.
 *
 * @param {Omit<HiddenInputField, 'type' | 'component' | 'children' | 'title'>} data
 * - `id`: Unique identifier for the hidden input field.
 * - `defaultValue`: The default value for the hidden input field. This can be a static value
 * or a function that computes the value based on the application state or other criteria.
 */
export const buildHiddenInput = (
  data: Omit<HiddenInputField, 'type' | 'component' | 'children' | 'title'>,
): HiddenInputField => {
  return {
    ...extractCommonFields({ title: '', ...data }),
    id: data.id,
    type: FieldTypes.HIDDEN_INPUT,
    component: FieldComponents.HIDDEN_INPUT,
    title: '',
    children: undefined,
    defaultValue: data.defaultValue,
  }
}

export function buildNationalIdWithNameField(
  data: Omit<NationalIdWithNameField, 'type' | 'component' | 'children'>,
): NationalIdWithNameField {
  const {
    disabled,
    required,
    customNationalIdLabel,
    customNameLabel,
    onNationalIdChange,
    onNameChange,
    nationalIdDefaultValue,
    nameDefaultValue,
    errorMessage,
    minAgePerson,
  } = data
  return {
    ...extractCommonFields(data),
    disabled,
    required,
    customNationalIdLabel,
    customNameLabel,
    onNationalIdChange,
    onNameChange,
    nationalIdDefaultValue,
    nameDefaultValue,
    errorMessage,
    minAgePerson,
    children: undefined,
    type: FieldTypes.NATIONAL_ID_WITH_NAME,
    component: FieldComponents.NATIONAL_ID_WITH_NAME,
  }
}

export function buildActionCardListField(
  data: Omit<ActionCardListField, 'type' | 'component' | 'children'>,
): ActionCardListField {
  const { items, space, marginTop, marginBottom } = data

  return {
    ...extractCommonFields(data),
    children: undefined,
    type: FieldTypes.ACTION_CARD_LIST,
    component: FieldComponents.ACTION_CARD_LIST,
    items,
    marginTop,
    marginBottom,
    space,
  }
}

export function buildTableRepeaterField(
  data: Omit<TableRepeaterField, 'type' | 'component' | 'children'>,
): TableRepeaterField {
  const {
    fields,
    table,
    formTitle,
    marginTop,
    marginBottom,
    titleVariant,
    addItemButtonText,
    saveItemButtonText,
    removeButtonTooltipText,
    getStaticTableData,
  } = data

  return {
    ...extractCommonFields(data),
    children: undefined,
    type: FieldTypes.TABLE_REPEATER,
    component: FieldComponents.TABLE_REPEATER,
    fields,
    table,
    formTitle,
    marginTop,
    marginBottom,
    titleVariant,
    addItemButtonText,
    saveItemButtonText,
    removeButtonTooltipText,
    getStaticTableData,
  }
}

export function buildStaticTableField(
  data: Omit<
    StaticTableField,
    | 'type'
    | 'component'
    | 'children'
    | 'id'
    | 'doesNotRequireAnswer'
    | 'colSpan'
    | 'defaultValue'
    | 'disabled'
    | 'width'
  >,
): StaticTableField {
  const {
    header,
    condition,
    dataTestId,
    title,
    description,
    rows,
    summary,
    marginBottom,
    marginTop = 2,
    titleVariant = 'h4',
  } = data

  return {
    id: '',
    title,
    width: 'full',
    doesNotRequireAnswer: true,
    condition,
    description,
    dataTestId,
    children: undefined,
    type: FieldTypes.STATIC_TABLE,
    component: FieldComponents.STATIC_TABLE,
    header,
    rows,
    summary,
    marginTop,
    marginBottom,
    titleVariant,
  }
}

export const buildBoxChartField = (
  data: Omit<BoxChartField, 'type' | 'component' | 'children' | 'title'>,
): BoxChartField => {
  const { titleLabel, boxes, calculateBoxStyle, keys, condition } = data
  return {
    title: '',
    id: '',
    children: undefined,
    type: FieldTypes.BOX_CHART,
    component: FieldComponents.BOX_CHART,
    titleLabel,
    boxes,
    calculateBoxStyle,
    keys,
    condition,
  }
}
