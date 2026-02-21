import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export default function PasswordInput({
  register,
  name,
  rules,
  value,
  onChange,
  placeholder = "*******",
  className,
  required = false
}) {
  const [show, setShow] = useState(false);

  const registerProps = register && name ? register(name, rules) : {};

  return (
    <div className="relative w-full">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...registerProps}
        {...(!register ? { value, onChange } : {})}
        required={required}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
