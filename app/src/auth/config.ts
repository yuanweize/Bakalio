import { brand } from "../studio/brand";
import { defineUserSignupFields } from "wasp/auth/providers/types";
import type {
  GetVerificationEmailContentFn,
  GetPasswordResetEmailContentFn,
} from "wasp/server/auth";
import { HttpError } from "wasp/server";
import { z } from "zod";
export const getEmailUserFields = defineUserSignupFields({
  email: (data) => {
    if (process.env.REGISTRATION_ENABLED !== "true")
      throw new HttpError(403, "REGISTRATION_CLOSED");
    return z.string().parse(data.email).trim().toLowerCase();
  },
  locale: (data) => z.enum(["cs", "en", "zh"]).catch("cs").parse(data.locale),
});
// All three languages are included because Wasp's email hook does not expose UI preferences.
export const verificationEmail: GetVerificationEmailContentFn = ({
  verificationLink,
}) => ({
  subject: `${brand.name} — Ověření e-mailu / Verify email / 验证邮箱`,
  text: `Ověř svůj e-mail / Verify your email / 请验证邮箱:\n${verificationLink}`,
  html: `<p>Ověř svůj e-mail / Verify your email / 请验证邮箱</p><a href="${verificationLink}">Ověřit / Verify / 验证</a>`,
});
export const resetEmail: GetPasswordResetEmailContentFn = ({
  passwordResetLink,
}) => ({
  subject: `${brand.name} — Nové heslo / Reset password / 重设密码`,
  text: `Obnov si heslo / Reset password / 重设密码:\n${passwordResetLink}`,
  html: `<p>Obnov si heslo / Reset password / 重设密码</p><a href="${passwordResetLink}">Pokračovat / Continue / 继续</a>`,
});
