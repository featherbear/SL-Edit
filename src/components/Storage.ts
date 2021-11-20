import type StorageModel from "../models/StorageModel"
import StorageProvider from "./StorageProvider";

export default new StorageProvider<StorageModel>({ devices: {}, settings: {} })