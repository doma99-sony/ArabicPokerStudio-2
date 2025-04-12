{pkgs}: {
  deps = [
    pkgs.zip
    pkgs.lsof
    pkgs.libxcrypt
    pkgs.curl
    pkgs.postgresql
    pkgs.jq
  ];
}
