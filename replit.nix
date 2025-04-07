{pkgs}: {
  deps = [
    pkgs.libxcrypt
    pkgs.curl
    pkgs.postgresql
    pkgs.jq
  ];
}
