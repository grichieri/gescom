import { Link } from "react-router";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

type ButtonProps = CommonProps & React.ComponentPropsWithoutRef<"button">;

/** Botón reutilizable. Por defecto es type="button" para no enviar formularios sin querer. */
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, fullWidth, className)} {...rest} />;
}

type ButtonLinkProps = CommonProps & React.ComponentPropsWithoutRef<typeof Link>;

/** Enlace con aspecto de botón (navegación sin recargar la página). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...rest
}: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, fullWidth, className)} {...rest} />;
}
