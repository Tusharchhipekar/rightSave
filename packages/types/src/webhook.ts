import { z } from "zod";
import { int } from "./common";

export const InstagramWebhookVerifyQuerySchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string().min(1),
  "hub.challenge": z.string().min(1),
});

export const InstagramWebhookPayloadSchema = z.looseObject({
  object: z.literal("instagram"),
  entry: z.array(
    z.looseObject({
      id: z.string(),
      time: int.optional(),
      messaging: z
        .array(
          z.looseObject({
            sender: z.looseObject({ id: z.string() }),
            recipient: z.looseObject({ id: z.string() }),
            timestamp: int,
            message: z
              .looseObject({
                mid: z.string(),
                text: z.string().optional(),
                attachments: z
                  .array(
                    z.looseObject({
                      type: z.string(),
                      payload: z.looseObject({ url: z.string().optional() }),
                    })
                  )
                  .optional(),
              })
              .optional(),
          })
        )
        .default([]),
    })
  ),
});

export type InstagramWebhookVerifyQuery = z.infer<typeof InstagramWebhookVerifyQuerySchema>;
export type InstagramWebhookPayload = z.infer<typeof InstagramWebhookPayloadSchema>;