{pkgs}: {
  deps = [
    pkgs.lsof
    pkgs.libxcrypt
    pkgs.curl
    pkgs.postgresql
    pkgs.jq
  ];
}
