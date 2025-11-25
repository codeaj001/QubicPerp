import { z } from "zod";

import { CurrencySchema } from "@/currency/currency.schema";

import { ProjectSchema } from "../../project.schema";

/**
 * Schema for Base Mode - Basic fields required
 */
export const BaseFormSchema = z.object({
  name: ProjectSchema.shape.name,
  slug: ProjectSchema.shape.slug,
  email: ProjectSchema.shape.email,
  description: ProjectSchema.shape.description,
  websiteUrl: ProjectSchema.shape.websiteUrl,
});

/**
 * Schema for Draft Mode - All fields optional except basic text fields
 */
export const DraftFormSchema = z.object({
  id: ProjectSchema.shape.id.optional(),
  name: ProjectSchema.shape.name,
  slug: ProjectSchema.shape.slug,
  email: ProjectSchema.shape.email,
  description: ProjectSchema.shape.description,
  websiteUrl: ProjectSchema.shape.websiteUrl,

  // Images - optional for draft
  photoUrl: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),
  bannerUrl: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),

  // Numeric fields - allow 0, undefined, or null
  tokensSupply: z.number().nonnegative().optional().nullable(),
  amountToRaise: z.number().nonnegative().optional().nullable(),
  tokensForSale: z.number().nonnegative().optional().nullable(),
  tokenPrice: z.number().nonnegative().optional().nullable(),
  threshold: z.number().nonnegative().optional().nullable(),
  cliff: z.number().nonnegative().optional().nullable(),
  unlockTokensTGE: z.number().nonnegative().optional().nullable(),
  vestingDays: z.number().nonnegative().optional().nullable(),

  // Dates - allow undefined or null
  startDate: z.date().optional().nullable(),
  TGEDate: z.date().optional().nullable(),

  // Strings - allow empty string, undefined, or null
  tokenName: z.string().optional().nullable(),

  // File URLs - allow File, string, undefined, or null
  whitepaperUrl: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  litepaperUrl: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  tokenomicsUrl: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),
  tokenImageUrl: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable(),

  // Social media links
  social: z
    .object({
      instagramUrl: z
        .string()
        .url({ message: "Debe ser una URL válida" })
        .regex(/^https?:\/\/(www\.)?instagram\.com\/.+/, { message: "Debe ser un enlace de Instagram válido" })
        .optional()
        .nullable(),
      xUrl: z
        .string()
        .url({ message: "Debe ser una URL válida" })
        .regex(/^https?:\/\/(www\.)?(twitter|x)\.com\/.+/, { message: "Debe ser un enlace de Twitter/X válido" })
        .optional()
        .nullable(),
      discordUrl: z
        .string()
        .url({ message: "Debe ser una URL válida" })
        .regex(/^https?:\/\/(www\.)?discord\.gg\/.+|^https?:\/\/(www\.)?discord\.com\/invite\/.+/, {
          message: "Debe ser un enlace de Discord válido",
        })
        .optional()
        .nullable(),
      telegramUrl: z
        .string()
        .url({ message: "Debe ser una URL válida" })
        .regex(/^https?:\/\/(t\.me|telegram\.me|telegram\.dog)\/.+/, {
          message: "Debe ser un enlace de Telegram válido",
        })
        .optional()
        .nullable(),
      mediumUrl: z
        .string()
        .url({ message: "Debe ser una URL válida" })
        .regex(/^https?:\/\/(www\.)?medium\.com\/.+/, { message: "Debe ser un enlace de Medium válido" })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Currency information
  currency: CurrencySchema.pick({
    id: true,
    name: true,
  })
    .optional()
    .nullable(),
});

/**
 * Schema for Publishing (Everything Required and Strict)
 */
export const ProjectFormSchema = z.object({
  id: ProjectSchema.shape.id.optional(),
  name: ProjectSchema.shape.name,
  slug: ProjectSchema.shape.slug,
  email: ProjectSchema.shape.email,
  description: ProjectSchema.shape.description,
  websiteUrl: ProjectSchema.shape.websiteUrl,

  // Required images
  photoUrl: z.union([z.instanceof(File), z.string().min(1)]),
  bannerUrl: z.union([z.instanceof(File), z.string().min(1)]),

  // Strict numeric fields
  tokensSupply: ProjectSchema.shape.tokensSupply,
  amountToRaise: ProjectSchema.shape.amountToRaise,
  tokensForSale: ProjectSchema.shape.tokensForSale,

  // Strict dates (future dates required)
  startDate: ProjectSchema.shape.startDate,
  TGEDate: ProjectSchema.shape.TGEDate,

  tokenName: ProjectSchema.shape.tokenName,
  threshold: ProjectSchema.shape.threshold,
  cliff: ProjectSchema.shape.cliff,
  unlockTokensTGE: ProjectSchema.shape.unlockTokensTGE,
  vestingDays: ProjectSchema.shape.vestingDays,

  // Required documents
  whitepaperUrl: z.union([z.instanceof(File), z.string().min(1)]),
  litepaperUrl: z.union([z.instanceof(File), z.string().min(1)]),
  tokenomicsUrl: z.union([z.instanceof(File), z.string().min(1)]),
  tokenImageUrl: z.union([z.instanceof(File), z.string().min(1)]),

  currency: CurrencySchema.pick({
    id: true,
    name: true,
  }),

  social: z.object({
    instagramUrl: z.string().optional().nullable(),
    xUrl: z.string().optional().nullable(),
    discordUrl: z.string().optional().nullable(),
    telegramUrl: z.string().optional().nullable(),
    mediumUrl: z.string().optional().nullable(),
  }),
});
