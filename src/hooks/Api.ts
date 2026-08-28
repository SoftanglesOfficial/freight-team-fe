/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** The category of the document */
export enum DocumentCategory {
  Invoice = "Invoice",
  BOL = "BOL",
}

export enum ActionType {
  Read = "Read",
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
  Upload = "Upload",
  Download = "Download",
  Assign = "Assign",
  Unassign = "Unassign",
  Review = "Review",
  Invite = "Invite",
  Join = "Join",
  Leave = "Leave",
  Follow = "Follow",
  Unfollow = "Unfollow",
  Like = "Like",
  Unlike = "Unlike",
  Share = "Share",
  Unshare = "Unshare",
  Report = "Report",
  Block = "Block",
  Unblock = "Unblock",
  Request = "Request",
  Accept = "Accept",
  Approve = "Approve",
  Reject = "Reject",
  Cancel = "Cancel",
  Complete = "Complete",
  Comment = "Comment",
  Reply = "Reply",
}

export enum ChatMessageType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Url = "url",
  GeoLocation = "geo_location",
  Entity = "entity",
}

export enum ChatType {
  Direct = "direct",
  Group = "group",
  Public = "public",
}

export enum QuoteRequestStatus {
  PendingQuote = "Pending Quote",
  InProgress = "In Progress",
  Quoted = "Quoted",
  Accepted = "Accepted",
  ActiveShipment = "Active Shipment",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Declined = "Declined",
  NotAccepted = "Not accepted",
}

export enum Role {
  SuperAdmin = "Super Admin",
  StandardUser = "Standard User",
  System = "System",
}

export interface UserPreference {
  email_notifications: boolean;
}

export interface User {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  provider: string;
  roles: string[];
  preference: UserPreference;
  is_active: boolean;
  is_online: boolean;
  is_available: boolean;
  phone?: string;
  company_name?: string;
}

export interface PaginationDto {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface PaginatedUsersDto {
  records: User[];
  pagination: PaginationDto;
}

export interface CreateCustomerDto {
  /** @default "John" */
  first_name: string;
  /** @default "Doe" */
  last_name?: string;
  /** @default "customer@example.com" */
  email: string;
  phone?: string;
  company_name?: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  phone?: string;
  company_name?: string;
}

export interface MakeUserPasswordDto {
  new_password: string;
  confirm_password: string;
}

export interface SignupDto {
  /** @default "John" */
  first_name: string;
  /** @default "Doe" */
  last_name?: string;
  /** @default "user@example.com" */
  email: string;
  /** @default "password" */
  password: string;
  /** @default "password" */
  confirm_password: string;
}

export interface AuthDto {
  access_token: string;
  user: User;
}

export interface SigninDto {
  /** @default "user@example.com" */
  email: string;
  /** @default "password" */
  password: string;
}

export interface UpdateProfileDto {
  first_name: string;
  last_name: string;
}

export interface UpdatePasswordDto {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface Message {
  message: string;
}

export interface UpdatePreferenceDto {
  email_notifications: boolean;
}

export interface ResetPasswordDto {
  /** @default "user@example.com" */
  email: string;
  /** @default "password" */
  password: string;
  /** @default "password" */
  confirm_password: string;
  /** @default "password" */
  secret: string;
}

export interface CreateUserSecretDto {
  /** @default "user@example.com" */
  email: string;
  /** @default "reset-password" */
  intent: string;
  /** @default "Otp" */
  type: string;
}

export interface ValidateUserSecretDto {
  /** @default "user@example.com" */
  email: string;
  /** @default "reset-password" */
  intent: string;
  /** @default "123456" */
  secret: string;
}

export interface Pallet {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface QuoteRequest {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  is_time_sensitive: boolean;
  /** @format date-time */
  delivery_date?: string;
  origin_zip_code: string;
  destination_zip_code: string;
  pallets: Pallet[];
  special_instructions?: string;
  is_residential: boolean;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  tracking_id: string;
  status: QuoteRequestStatus;
  /** Array of associated document IDs */
  documents?: string[];
  quoteAmount?: object | null;
  carrierQuoteNumber?: object | null;
  carrier?: object | null;
  estimatedTransitDays?: object | null;
  target_price?: object | null;
  feedback?: object;
  /** ID of the associated customer (User) */
  customer_id?: string;
  /** @default false */
  convertedToShipment: boolean;
}

export interface CreateQuoteRequestDto {
  /** @default false */
  is_time_sensitive?: boolean;
  /** @default "2026-05-07T13:00:59.572Z" */
  delivery_date?: string;
  /** @example "10001" */
  origin_zip_code: string;
  /** @example "10002" */
  destination_zip_code: string;
  /** @example [{"weight":100,"length":100,"width":100,"height":100}] */
  pallets: Pallet[];
  /** @example "Special instructions" */
  special_instructions?: string;
  /** @default false */
  is_residential?: boolean;
  /** @example "John Doe" */
  full_name: string;
  /** @example "john.doe@example.com" */
  email: string;
  /** @example "+1234567890" */
  phone: string;
  /** @example "Example Inc." */
  company_name?: string;
  /** @example 1500.5 */
  quoteAmount?: number;
  /** @example "CQ-12345" */
  carrierQuoteNumber?: string;
}

export interface PaginatedQuoteRequestsDto {
  records: QuoteRequest[];
  pagination: PaginationDto;
}

export interface UpdateQuoteRequestDto {
  status: QuoteRequestStatus;
  /** @example 1500.5 */
  quoteAmount?: object | null;
  /** @example "CQ-12345" */
  carrierQuoteNumber?: object | null;
  full_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  carrier?: object | null;
  estimatedTransitDays?: object | null;
  target_price?: object | null;
  feedback?: object;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
  company_name?: string;
}

export interface Address {
  formatted_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  businessName?: string;
}

export interface LoadItem {
  /** Weight in lbs */
  weight: number;
  /** Length in inches */
  length: number;
  /** Width in inches */
  width: number;
  /** Height in inches */
  height: number;
  /**
   * Quantity of items
   * @default 1
   */
  quantity?: number;
  /** Description of the load item */
  description?: string;
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  /** @format date-time */
  updatedAt?: string;
}

export interface StatusHistoryEntry {
  status: string;
  note?: string;
  location?: object;
  /** @format date-time */
  timestamp: string;
  updatedBy?: string;
  internal?: boolean;
}

export interface ShipmentNote {
  text: string;
  internal: boolean;
  /** @format date-time */
  createdAt: string;
  createdBy?: string;
}

export interface Shipment {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  customer: CustomerInfo;
  /** ID of the associated customer (User) */
  customer_id?: string;
  origin_address: Address;
  destination_address: Address;
  quote_tracking_id?: string;
  ftlWareHouseId?: string | null;
  proNumber?: string | null;
  /** Customer PO number */
  poNumber?: string;
  carrierName: string;
  /** @format date-time */
  dateOfOrder: string;
  /** @format date-time */
  pickupDate?: string;
  /** @format date-time */
  estimatedDeliveryDate: string;
  /** @format date-time */
  deliveryDate?: string;
  notes?: ShipmentNote[];
  /** Time sensitive shipment indicator */
  timeSensitive: "yes" | "no";
  /** @format date-time */
  mustArriveByDate?: string;
  timeSensitiveNotes?: string;
  /** The associated quote request (populated when fetched) */
  quote?: string | QuoteRequest | null;
  /** Array of associated document IDs */
  documents?: string[];
  /** Array of load items with dimensions and weight */
  load_items?: LoadItem[];
  current_location?: CurrentLocation;
  /** Shipment status */
  status?: "pending" | "in-transit" | "delivered";
  status_history?: StatusHistoryEntry[];
}

export interface ChatUnreadMessages {
  total_unread_messages: number;
  chat_id: string;
}

export interface ChatStatsDto {
  chat_unread_messages: ChatUnreadMessages[];
  total_unread_chats: number;
}

export interface CreateChatDto {
  members: string[];
  type: ChatType;
}

export interface Chat {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  is_favorite: boolean;
  members: User[];
  name: string;
  type: ChatType;
  admins: User[];
  blocked_users: User[];
  last_message: ChatMessage;
  /** @format date-time */
  last_message_at: string;
  is_public?: boolean;
  public_room_name?: string;
  max_participants?: number;
}

export interface ChatMessage {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  sender: User;
  content: string;
  type: ChatMessageType;
  delivered_to: User[];
  seen_by: User[];
  seen: boolean;
  chat: Chat;
}

export interface PaginatedChatsDto {
  records: Chat[];
  pagination: PaginationDto;
}

export interface UpdateChatDto {
  name?: string;
}

export interface CreateChatMessageDto {
  content: string | object | any[];
  type: ChatMessageType;
}

export interface PaginatedChatMessagesDto {
  records: ChatMessage[];
  pagination: PaginationDto;
}

export interface JoinPublicChatDto {
  /** Name of the public chat room */
  room_name: string;
  /** Anonymous user identifier */
  anonymous_user_id?: string;
  /** Display name for anonymous user */
  display_name?: string;
}

export interface CreatePublicChatMessageDto {
  /** Message content */
  content: string;
  /** Anonymous user identifier */
  anonymous_user_id?: string;
  /** Display name for anonymous user */
  display_name?: string;
}

export interface UserPreview {
  _id: string;
  first_name: string;
  last_name?: string;
  email: string;
}

export interface EntityInfo {
  type: string;
  _id: string;
  title: string;
}

export interface Notification {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  message: string;
  user: UserPreview;
  entity: EntityInfo;
  action: string;
  url?: string;
  seen: boolean;
}

export interface PaginatedNotificationsDto {
  records: Notification[];
  pagination: PaginationDto;
}

export interface UpdateNotificationDto {
  seen: boolean;
}

export interface Activity {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  message: string;
  action: ActionType;
  entity: EntityInfo;
  user: UserPreview;
  change?: object;
}

export interface PaginatedActivitiesDto {
  records: Activity[];
  pagination: PaginationDto;
}

export interface ToggleFavoriteDto {
  resource_type: string;
  resource_id: string;
}

export interface ToggleFavoriteResponseDto {
  is_favorite: boolean;
  resource_id: string;
  resource_type: string;
}

export interface Favorite {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  resource: object;
  resource_type: string;
  user_id: string;
}

export interface PaginatedFavoritesDto {
  records: Favorite[];
  pagination: PaginationDto;
}

export interface UploadFileResponseDto {
  /**
   * The URL of the uploaded file
   * @example "https://ik.imagekit.io/gbeubjjsq/uploads/file_123.jpg"
   */
  url: string;
  /**
   * The file ID assigned by ImageKit
   * @example "file_123"
   */
  fileId: string;
  /**
   * The name of the uploaded file
   * @example "document.pdf"
   */
  name: string;
  /**
   * The size of the file in bytes
   * @example 1024000
   */
  size: number;
  /**
   * The file type/MIME type
   * @example "image/jpeg"
   */
  fileType: string;
  /**
   * The file path where the file was uploaded (including folder)
   * @example "/uploads/file_123.jpg"
   */
  folder: string;
  /**
   * The upload timestamp
   * @example "2024-12-30T12:00:00.000Z"
   */
  uploadedAt: string;
}

export interface TrackingResponseDto {
  shipment: Shipment | null;
  quote: QuoteRequest | null;
}

export interface CreateShipmentDto {
  customer: CustomerInfo;
  customer_id?: string;
  origin_address: Address;
  destination_address: Address;
  quote_tracking_id?: string;
  ftlWareHouseId?: string | null;
  proNumber?: string | null;
  /** Customer PO number */
  poNumber?: string;
  carrierName: string;
  dateOfOrder: string;
  pickupDate?: string;
  estimatedDeliveryDate: string;
  deliveryDate?: string;
  notes?: string;
  /** Time sensitive shipment indicator */
  timeSensitive: "yes" | "no";
  mustArriveByDate?: string;
  timeSensitiveNotes?: string;
  quoteId?: string;
  /** Load items with dimensions and weight */
  load_items?: LoadItem[];
  /** Array of associated document IDs */
  documents?: string[];
  /** Shipment status */
  status?: "pending" | "in-transit" | "delivered";
}

export interface PaginatedShipmentsDto {
  records: Shipment[];
  pagination: PaginationDto;
}

export interface UpdateShipmentDto {
  customer?: CustomerInfo;
  customer_id?: string;
  origin_address?: Address;
  destination_address?: Address;
  quote_tracking_id?: string;
  ftlWareHouseId?: string | null;
  proNumber?: string | null;
  /** Customer PO number */
  poNumber?: string;
  carrierName?: string;
  dateOfOrder?: string;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  deliveryDate?: string;
  newNote?: { text: string; internal: boolean };
  /** Time sensitive shipment indicator */
  timeSensitive?: "yes" | "no";
  mustArriveByDate?: string;
  timeSensitiveNotes?: string;
  quoteId?: string;
  /** Load items with dimensions and weight */
  load_items?: LoadItem[];
  /** Array of associated document IDs */
  documents?: string[];
  /** Shipment status */
  status?: "pending" | "in-transit" | "delivered";
}

export interface UpdateLocationDto {
  /**
   * Latitude of the current location
   * @example 34.0522
   */
  latitude: number;
  /**
   * Longitude of the current location
   * @example -118.2437
   */
  longitude: number;
  /**
   * Optional note for this location update
   * @example "Arrived at distribution center"
   */
  note?: string;
}

export interface AddNoteDto {
  /**
   * The content of the note
   * @example "Client requested an earlier delivery if possible."
   */
  note: string;
}

export interface CreateDocumentDto {
  /**
   * The name of the document
   * @example "Invoice-001.pdf"
   */
  name: string;
  /**
   * The size of the document in bytes
   * @example 1024000
   */
  size: number;
  /**
   * The MIME type of the document
   * @example "application/pdf"
   */
  type: string;
  /**
   * The URL where the document is stored
   * @example "https://ik.imagekit.io/gbeubjjsq/uploads/document_123.pdf"
   */
  url: string;
  /**
   * The file ID from the storage service
   * @example "file_123"
   */
  file_id?: string;
  /** ID of the associated shipment */
  shipment_id?: string;
  /** ID of the associated quote request */
  quote_request_id?: string;
  /** ID of the assigned customer */
  customer_id?: string;
  /**
   * The category of the document
   * @example "Invoice"
   */
  category: DocumentCategory;
}

export interface Document {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  category: DocumentCategory;
  /**
   * The name of the document
   * @example "Invoice-001.pdf"
   */
  name: string;
  /**
   * The size of the document in bytes
   * @example 1024000
   */
  size: number;
  /**
   * The MIME type of the document
   * @example "application/pdf"
   */
  type: string;
  /**
   * The internal ID in format sh-0000000 (auto-generated)
   * @example "sh-0000123"
   */
  internal_id: string;
  /**
   * The URL where the document is stored
   * @example "https://ik.imagekit.io/gbeubjjsq/uploads/document_123.pdf"
   */
  url: string;
  /**
   * The file ID from the storage service
   * @example "file_123"
   */
  file_id?: string;
  /** ID of the associated shipment */
  shipment_id?: string;
  /** ID of the associated quote request */
  quote_request_id?: string;
  /** ID of the assigned customer (User) */
  customer?: string | User | null;
}

export interface PaginatedDocumentsDto {
  records: Document[];
  pagination: PaginationDto;
}

export interface UpdateDocumentDto {
  /**
   * The name of the document
   * @example "Invoice-001.pdf"
   */
  name?: string;
  /**
   * The size of the document in bytes
   * @example 1024000
   */
  size?: number;
  /**
   * The MIME type of the document
   * @example "application/pdf"
   */
  type?: string;
  /**
   * The URL where the document is stored
   * @example "https://ik.imagekit.io/gbeubjjsq/uploads/document_123.pdf"
   */
  url?: string;
  /**
   * The file ID from the storage service
   * @example "file_123"
   */
  file_id?: string;
  /** ID of the associated shipment */
  shipment_id?: string;
  /** ID of the associated quote request */
  quote_request_id?: string;
  /** ID of the assigned customer */
  customer_id?: string;
  /**
   * The category of the document
   * @example "Invoice"
   */
  category?: DocumentCategory;
  /**
   * The internal ID in format sh-0000000
   * @example "sh-0000123"
   */
  internal_id?: string;
}

export interface CreateLiveChatDto {
  anon_id: string;
  subject: string;
  user_name: string;
  user_email?: string;
}

export interface UnreadStats {
  for_admins: number;
  for_user: number;
}

export interface LiveChat {
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  anon_id: string;
  subject: string;
  user_name: string;
  user_email?: string;
  is_archived: boolean;
  unread_stats: UnreadStats;
}

export type ObjectId = object;

export interface LiveChatMessage {
  message: string;
  seen: boolean;
  sender_id: string;
  chat_id: ObjectId;
}

export interface UpdateLiveChatDto {
  is_archived?: boolean;
}

export interface LiveChatMessageForAdminDto {
  message: string;
  sender_id: string;
  chat_id: string;
}

export interface LiveChatMessageForUserDto {
  message: string;
  chat_id: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title frieght-team-nest-be
 * @version 0.0.1
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  user = {
    /**
     * No description
     *
     * @tags User
     * @name UserControllerIndex
     * @request GET:/user
     * @secure
     */
    userControllerIndex: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        is_active?: boolean;
        search?: string;
        role?: Role;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedUsersDto, any>({
        path: `/user`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerCreateCustomer
     * @request POST:/user/create-customer
     * @secure
     */
    userControllerCreateCustomer: (
      data: CreateCustomerDto,
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/user/create-customer`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerFindOne
     * @request GET:/user/{id}
     * @secure
     */
    userControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/user/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerUpdate
     * @request PATCH:/user/{id}
     * @secure
     */
    userControllerUpdate: (
      id: string,
      data: UpdateUserDto,
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/user/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerRemove
     * @request DELETE:/user/{id}
     * @secure
     */
    userControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/user/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerMakePassword
     * @request PATCH:/user/{id}/make-password
     * @secure
     */
    userControllerMakePassword: (
      id: string,
      data: MakeUserPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/user/${id}/make-password`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerSignup
     * @request POST:/auth/signup
     * @secure
     */
    authControllerSignup: (data: SignupDto, params: RequestParams = {}) =>
      this.request<AuthDto, any>({
        path: `/auth/signup`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @request POST:/auth/login
     * @secure
     */
    authControllerLogin: (data: SigninDto, params: RequestParams = {}) =>
      this.request<AuthDto, any>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerGetProfile
     * @request GET:/auth/profile
     * @secure
     */
    authControllerGetProfile: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/auth/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerUpdateProfile
     * @request PATCH:/auth/profile
     * @secure
     */
    authControllerUpdateProfile: (
      data: UpdateProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<AuthDto, any>({
        path: `/auth/profile`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerUpdatePassword
     * @request PATCH:/auth/update-password
     * @secure
     */
    authControllerUpdatePassword: (
      data: UpdatePasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<Message, any>({
        path: `/auth/update-password`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerUpdatePreference
     * @request PATCH:/auth/preference
     * @secure
     */
    authControllerUpdatePreference: (
      data: UpdatePreferenceDto,
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/auth/preference`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerResetPassword
     * @request POST:/auth/reset-password
     * @secure
     */
    authControllerResetPassword: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<Message, any>({
        path: `/auth/reset-password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerGoogleAuth
     * @request GET:/auth/google
     * @secure
     */
    authControllerGoogleAuth: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/google`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerGoogleAuthRedirect
     * @request GET:/auth/google/redirect
     * @secure
     */
    authControllerGoogleAuthRedirect: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/google/redirect`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerFacebookAuth
     * @request GET:/auth/facebook
     * @secure
     */
    authControllerFacebookAuth: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/facebook`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerFacebookAuthRedirect
     * @request GET:/auth/facebook/redirect
     * @secure
     */
    authControllerFacebookAuthRedirect: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/facebook/redirect`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerSeedAdminUser
     * @request POST:/auth/seed-admin-user
     * @secure
     */
    authControllerSeedAdminUser: (params: RequestParams = {}) =>
      this.request<Message, any>({
        path: `/auth/seed-admin-user`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  userSecret = {
    /**
     * No description
     *
     * @tags UserSecret
     * @name UserSecretControllerCreate
     * @request POST:/user-secret
     * @secure
     */
    userSecretControllerCreate: (
      data: CreateUserSecretDto,
      params: RequestParams = {},
    ) =>
      this.request<Message, any>({
        path: `/user-secret`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserSecret
     * @name UserSecretControllerValidate
     * @request POST:/user-secret/validate
     * @secure
     */
    userSecretControllerValidate: (
      data: ValidateUserSecretDto,
      params: RequestParams = {},
    ) =>
      this.request<Message, any>({
        path: `/user-secret/validate`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  quoteRequest = {
    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerTrack
     * @request GET:/quote-request/tracking/{trackingId}
     * @secure
     */
    quoteRequestControllerTrack: (
      trackingId: string,
      params: RequestParams = {},
    ) =>
      this.request<QuoteRequest, any>({
        path: `/quote-request/tracking/${trackingId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerCreate
     * @request POST:/quote-request
     * @secure
     */
    quoteRequestControllerCreate: (
      data: CreateQuoteRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<QuoteRequest, any>({
        path: `/quote-request`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerFindAll
     * @request GET:/quote-request
     * @secure
     */
    quoteRequestControllerFindAll: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        full_name?: string;
        email?: string;
        tracking_id?: string;
        status?: QuoteRequestStatus;
        customer_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedQuoteRequestsDto, any>({
        path: `/quote-request`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerFindOne
     * @request GET:/quote-request/{id}
     * @secure
     */
    quoteRequestControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<QuoteRequest, any>({
        path: `/quote-request/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerUpdate
     * @request PATCH:/quote-request/{id}
     * @secure
     */
    quoteRequestControllerUpdate: (
      id: string,
      data: UpdateQuoteRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/quote-request/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerRemove
     * @request DELETE:/quote-request/{id}
     * @secure
     */
    quoteRequestControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/quote-request/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerAcceptAndConvert
     * @request POST:/quote-request/{id}/accept
     * @secure
     */
    quoteRequestControllerAcceptAndConvert: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<Shipment, any>({
        path: `/quote-request/${id}/accept`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags QuoteRequest
     * @name QuoteRequestControllerSendQuoteEmail
     * @request POST:/quote-request/{id}/send-email
     * @secure
     */
    quoteRequestControllerSendQuoteEmail: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<ObjectId, any>({
        path: `/quote-request/${id}/send-email`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  chat = {
    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerGetUnreadStats
     * @request GET:/chat/unread-stats
     * @secure
     */
    chatControllerGetUnreadStats: (params: RequestParams = {}) =>
      this.request<ChatStatsDto, any>({
        path: `/chat/unread-stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerCreate
     * @request POST:/chat
     * @secure
     */
    chatControllerCreate: (data: CreateChatDto, params: RequestParams = {}) =>
      this.request<Chat, any>({
        path: `/chat`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerFindAll
     * @request GET:/chat
     * @secure
     */
    chatControllerFindAll: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        user_id?: string;
        is_favorite?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedChatsDto, any>({
        path: `/chat`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerFindOne
     * @request GET:/chat/{id}
     * @secure
     */
    chatControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Chat, any>({
        path: `/chat/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerUpdate
     * @request PATCH:/chat/{id}
     * @secure
     */
    chatControllerUpdate: (
      id: string,
      data: UpdateChatDto,
      params: RequestParams = {},
    ) =>
      this.request<Chat, any>({
        path: `/chat/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerRemove
     * @request DELETE:/chat/{id}
     * @secure
     */
    chatControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<Chat, any>({
        path: `/chat/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ChatMessage
     * @name ChatMessageControllerCreate
     * @request POST:/chat/{chat_id}/message
     * @secure
     */
    chatMessageControllerCreate: (
      chatId: string,
      data: CreateChatMessageDto,
      params: RequestParams = {},
    ) =>
      this.request<ChatMessage, any>({
        path: `/chat/${chatId}/message`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ChatMessage
     * @name ChatMessageControllerFindAll
     * @request GET:/chat/{chat_id}/message
     * @secure
     */
    chatMessageControllerFindAll: (
      chatId: string,
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedChatMessagesDto, any>({
        path: `/chat/${chatId}/message`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags ChatMessage
     * @name ChatMessageControllerMarkAsSeen
     * @request PATCH:/chat/{chat_id}/message/{id}/seen
     * @secure
     */
    chatMessageControllerMarkAsSeen: (
      id: string,
      chatId: string,
      params: RequestParams = {},
    ) =>
      this.request<ChatMessage, any>({
        path: `/chat/${chatId}/message/${id}/seen`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  publicChat = {
    /**
     * No description
     *
     * @tags Public Chat
     * @name PublicChatControllerJoinPublicChat
     * @summary Join a public chat room
     * @request POST:/public-chat/join
     * @secure
     */
    publicChatControllerJoinPublicChat: (
      data: JoinPublicChatDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/public-chat/join`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public Chat
     * @name PublicChatControllerGetPublicChatRooms
     * @summary Get all public chat rooms
     * @request GET:/public-chat/rooms
     * @secure
     */
    publicChatControllerGetPublicChatRooms: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/public-chat/rooms`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public Chat
     * @name PublicChatControllerSendMessage
     * @summary Send a message to a public chat
     * @request POST:/public-chat/{chatId}/messages
     * @secure
     */
    publicChatControllerSendMessage: (
      chatId: string,
      data: CreatePublicChatMessageDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/public-chat/${chatId}/messages`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public Chat
     * @name PublicChatControllerGetMessages
     * @summary Get messages from a public chat
     * @request GET:/public-chat/{chatId}/messages
     * @secure
     */
    publicChatControllerGetMessages: (
      chatId: string,
      query: {
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/public-chat/${chatId}/messages`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public Chat
     * @name PublicChatControllerGetParticipants
     * @summary Get active participants in a public chat
     * @request GET:/public-chat/{chatId}/participants
     * @secure
     */
    publicChatControllerGetParticipants: (
      chatId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/public-chat/${chatId}/participants`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  notification = {
    /**
     * No description
     *
     * @tags Notification
     * @name NotificationControllerIndex
     * @request GET:/notification
     * @secure
     */
    notificationControllerIndex: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        seen?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedNotificationsDto, any>({
        path: `/notification`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notification
     * @name NotificationControllerFindOne
     * @request GET:/notification/{id}
     * @secure
     */
    notificationControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Notification, any>({
        path: `/notification/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notification
     * @name NotificationControllerUpdateOne
     * @request PATCH:/notification/{id}
     * @secure
     */
    notificationControllerUpdateOne: (
      id: string,
      data: UpdateNotificationDto,
      params: RequestParams = {},
    ) =>
      this.request<Notification, any>({
        path: `/notification/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notification
     * @name NotificationControllerRemoveOne
     * @request DELETE:/notification/{id}
     * @secure
     */
    notificationControllerRemoveOne: (id: string, params: RequestParams = {}) =>
      this.request<Notification, any>({
        path: `/notification/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  activity = {
    /**
     * No description
     *
     * @tags Activity
     * @name ActivityControllerFind
     * @request GET:/activity
     * @secure
     */
    activityControllerFind: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        entity_type?: string;
        entity_id?: string;
        action?: string;
        user_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedActivitiesDto, any>({
        path: `/activity`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Activity
     * @name ActivityControllerFindOne
     * @request GET:/activity/{id}
     * @secure
     */
    activityControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Activity, any>({
        path: `/activity/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  favorite = {
    /**
     * No description
     *
     * @tags Favorite
     * @name FavoriteControllerToggleFavorite
     * @request POST:/favorite
     * @secure
     */
    favoriteControllerToggleFavorite: (
      data: ToggleFavoriteDto,
      params: RequestParams = {},
    ) =>
      this.request<ToggleFavoriteResponseDto, any>({
        path: `/favorite`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Favorite
     * @name FavoriteControllerFindAll
     * @request GET:/favorite/{type}
     * @secure
     */
    favoriteControllerFindAll: (
      type: string,
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedFavoritesDto, any>({
        path: `/favorite/${type}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Favorite
     * @name FavoriteControllerFindOne
     * @request GET:/favorite/{type}/{resourceId}
     * @secure
     */
    favoriteControllerFindOne: (
      type: string,
      resourceId: string,
      params: RequestParams = {},
    ) =>
      this.request<Favorite, any>({
        path: `/favorite/${type}/${resourceId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  fileUpload = {
    /**
     * No description
     *
     * @tags FileUpload
     * @name FileUploadControllerUploadFile
     * @request POST:/file-upload/upload
     * @secure
     */
    fileUploadControllerUploadFile: (
      data: {
        /**
         * Image or document file (max 10MB). Supported formats: JPEG, PNG, GIF, WebP, SVG, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, RTF, JSON, XML
         * @format binary
         */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<UploadFileResponseDto, any>({
        path: `/file-upload/upload`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  shipment = {
    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerTrack
     * @request GET:/shipment/track/{proNumber}
     * @secure
     */
    shipmentControllerTrack: (proNumber: string, params: RequestParams = {}) =>
      this.request<TrackingResponseDto, any>({
        path: `/shipment/track/${proNumber}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerCreate
     * @request POST:/shipment
     * @secure
     */
    shipmentControllerCreate: (
      data: CreateShipmentDto,
      params: RequestParams = {},
    ) =>
      this.request<Shipment, any>({
        path: `/shipment`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerFindAll
     * @request GET:/shipment
     * @secure
     */
    shipmentControllerFindAll: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        proNumber?: string;
        poNumber?: string;
        ftlWareHouseId?: string;
        carrierName?: string;
        customer_name?: string;
        customer_email?: string;
        dateOfOrder_from?: string;
        dateOfOrder_to?: string;
        pickupDate_from?: string;
        pickupDate_to?: string;
        estimatedDeliveryDate_from?: string;
        estimatedDeliveryDate_to?: string;
        deliveryDate_from?: string;
        deliveryDate_to?: string;
        status?: string;
        quoteId?: string;
        customer_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedShipmentsDto, any>({
        path: `/shipment`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerFindOne
     * @request GET:/shipment/{id}
     * @secure
     */
    shipmentControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Shipment, any>({
        path: `/shipment/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerUpdate
     * @request PATCH:/shipment/{id}
     * @secure
     */
    shipmentControllerUpdate: (
      id: string,
      data: UpdateShipmentDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shipment/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerRemove
     * @request DELETE:/shipment/{id}
     * @secure
     */
    shipmentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/shipment/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerFindByFtlId
     * @request GET:/shipment/pro/{proNumber}
     * @secure
     */
    shipmentControllerFindByFtlId: (
      proNumber: string,
      params: RequestParams = {},
    ) =>
      this.request<Shipment, any>({
        path: `/shipment/pro/${proNumber}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerUpdateLocation
     * @summary Update current location of a shipment
     * @request PATCH:/shipment/{id}/update-location
     * @secure
     */
    shipmentControllerUpdateLocation: (
      id: string,
      data: UpdateLocationDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shipment/${id}/update-location`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Shipment
     * @name ShipmentControllerAddNote
     * @summary Add a manual note to the shipment history
     * @request PATCH:/shipment/{id}/add-note
     * @secure
     */
    shipmentControllerAddNote: (
      id: string,
      data: AddNoteDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shipment/${id}/add-note`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  document = {
    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerCreate
     * @request POST:/document
     * @secure
     */
    documentControllerCreate: (
      data: CreateDocumentDto,
      params: RequestParams = {},
    ) =>
      this.request<Document, any>({
        path: `/document`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerFindAll
     * @request GET:/document
     * @secure
     */
    documentControllerFindAll: (
      query: {
        /** @default 1 */
        page: number;
        /** @default 10 */
        pageSize: number;
        /** The category of the document */
        category?: DocumentCategory;
        /**
         * Search term to filter documents by name
         * @example "invoice"
         */
        search?: string;
        /**
         * Filter by document type
         * @example "application/pdf"
         */
        type?: string;
        /**
         * Filter by shipment ID
         * @example "507f1f77bcf86cd799439011"
         */
        shipment_id?: string;
        /**
         * Filter by quote request ID
         * @example "507f1f77bcf86cd799439011"
         */
        quote_request_id?: string;
        /**
         * Filter by customer ID
         * @example "507f1f77bcf86cd799439011"
         */
        customer_id?: string;
        /**
         * Filter by customer email
         * @example "customer@example.com"
         */
        customer_email?: string;
        /**
         * Sort field
         * @example "createdAt"
         */
        sortBy?: "createdAt" | "updatedAt" | "name" | "size";
        /**
         * Sort order
         * @example "desc"
         */
        sortOrder?: "asc" | "desc";
      },
      params: RequestParams = {},
    ) =>
      this.request<PaginatedDocumentsDto, any>({
        path: `/document`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerFindOne
     * @request GET:/document/{id}
     * @secure
     */
    documentControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Document, any>({
        path: `/document/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerUpdate
     * @request PATCH:/document/{id}
     * @secure
     */
    documentControllerUpdate: (
      id: string,
      data: UpdateDocumentDto,
      params: RequestParams = {},
    ) =>
      this.request<Document, any>({
        path: `/document/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerRemove
     * @request DELETE:/document/{id}
     * @secure
     */
    documentControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/document/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerFindByShipmentId
     * @request GET:/document/shipment/{shipmentId}
     * @secure
     */
    documentControllerFindByShipmentId: (
      shipmentId: string,
      params: RequestParams = {},
    ) =>
      this.request<Document[], any>({
        path: `/document/shipment/${shipmentId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Document
     * @name DocumentControllerFindByQuoteRequestId
     * @request GET:/document/quote-request/{quoteRequestId}
     * @secure
     */
    documentControllerFindByQuoteRequestId: (
      quoteRequestId: string,
      params: RequestParams = {},
    ) =>
      this.request<Document[], any>({
        path: `/document/quote-request/${quoteRequestId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  liveChat = {
    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerCreate
     * @request POST:/live-chat
     * @secure
     */
    liveChatControllerCreate: (
      data: CreateLiveChatDto,
      params: RequestParams = {},
    ) =>
      this.request<LiveChat, any>({
        path: `/live-chat`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerFindAll
     * @request GET:/live-chat
     * @secure
     */
    liveChatControllerFindAll: (params: RequestParams = {}) =>
      this.request<LiveChat[], any>({
        path: `/live-chat`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerGetTotalUnreadForAdmin
     * @request GET:/live-chat/stats/total-unread
     * @secure
     */
    liveChatControllerGetTotalUnreadForAdmin: (params: RequestParams = {}) =>
      this.request<number, any>({
        path: `/live-chat/stats/total-unread`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerFindByAnonId
     * @request GET:/live-chat/anon/{anonId}
     * @secure
     */
    liveChatControllerFindByAnonId: (
      anonId: string,
      params: RequestParams = {},
    ) =>
      this.request<LiveChat, any>({
        path: `/live-chat/anon/${anonId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerGetMessagesByAnonId
     * @request GET:/live-chat/anon/{anonId}/messages
     * @secure
     */
    liveChatControllerGetMessagesByAnonId: (
      anonId: string,
      params: RequestParams = {},
    ) =>
      this.request<LiveChatMessage[], any>({
        path: `/live-chat/anon/${anonId}/messages`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerFindOne
     * @request GET:/live-chat/{id}
     * @secure
     */
    liveChatControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerUpdate
     * @request PATCH:/live-chat/{id}
     * @secure
     */
    liveChatControllerUpdate: (
      id: string,
      data: UpdateLiveChatDto,
      params: RequestParams = {},
    ) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerRemove
     * @request DELETE:/live-chat/{id}
     * @secure
     */
    liveChatControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerGetMessages
     * @request GET:/live-chat/{id}/messages
     * @secure
     */
    liveChatControllerGetMessages: (id: string, params: RequestParams = {}) =>
      this.request<LiveChatMessage[], any>({
        path: `/live-chat/${id}/messages`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerMessageToAdmin
     * @request POST:/live-chat/{id}/msg-to-admin
     * @secure
     */
    liveChatControllerMessageToAdmin: (
      id: string,
      data: LiveChatMessageForAdminDto,
      params: RequestParams = {},
    ) =>
      this.request<LiveChatMessage, any>({
        path: `/live-chat/${id}/msg-to-admin`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerMessageToUser
     * @request POST:/live-chat/{id}/msg-to-user
     * @secure
     */
    liveChatControllerMessageToUser: (
      id: string,
      data: LiveChatMessageForUserDto,
      params: RequestParams = {},
    ) =>
      this.request<LiveChatMessage, any>({
        path: `/live-chat/${id}/msg-to-user`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerClose
     * @request POST:/live-chat/{id}/close
     * @secure
     */
    liveChatControllerClose: (id: string, params: RequestParams = {}) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}/close`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerMarkAsSeenByAdmin
     * @request PATCH:/live-chat/{id}/seen
     * @secure
     */
    liveChatControllerMarkAsSeenByAdmin: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}/seen`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags LiveChat
     * @name LiveChatControllerMarkAsSeenByUser
     * @request PATCH:/live-chat/{id}/seen-by-user
     * @secure
     */
    liveChatControllerMarkAsSeenByUser: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<LiveChat, any>({
        path: `/live-chat/${id}/seen-by-user`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
