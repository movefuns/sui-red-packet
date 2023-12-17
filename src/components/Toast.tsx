import { Alert } from "@mui/material";
import { CustomContentProps, SnackbarContent } from "notistack";
import { forwardRef } from "react";

const Toast = forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { id, message, variant, action } = props;

  return (
    <SnackbarContent ref={ref}>
      <Alert
        severity={variant === "default" ? "info" : variant}
        variant="filled"
        sx={{ width: "100%" }}
        action={typeof action === "function" ? action(id) : action}
      >
        {message}
      </Alert>
    </SnackbarContent>
  );
});

export default Toast;
