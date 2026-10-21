"""Publica dist en la raíz de la cuenta FTP, sin borrar archivos del hosting."""
import ftplib
import os
from pathlib import Path
import ssl


def main():
    config = {name: os.environ.get(name, '') for name in ('FTP_HOST', 'FTP_USER', 'FTP_PASSWORD')}
    if not all(config.values()):
        raise SystemExit('Faltan secretos FTP_HOST, FTP_USER o FTP_PASSWORD.')
    files = sorted(p for p in Path('dist').rglob('*') if p.is_file() and p.name != '_headers')
    if not Path('dist/index.html').is_file():
        raise SystemExit('Falta preparar dist/index.html.')
    # Publicar recursos antes del documento que los referencia.
    files.sort(key=lambda p: p.as_posix() == 'dist/index.html')
    with ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=60) as ftp:
        ftp.connect(config['FTP_HOST'], 21)
        ftp.login(config['FTP_USER'], config['FTP_PASSWORD'])
        ftp.prot_p()
        root = ftp.pwd()
        for source in files:
            relative = source.relative_to('dist')
            ftp.cwd(root)
            for directory in relative.parts[:-1]:
                try:
                    ftp.mkd(directory)
                except ftplib.error_perm:
                    pass  # cwd comprobará si la carpeta existe y es accesible.
                ftp.cwd(directory)
            with source.open('rb') as data:
                ftp.storbinary('STOR ' + relative.name, data)
    print('Transferencia completada. Revisar https://www.amse.cl/.')


if __name__ == '__main__':
    main()
