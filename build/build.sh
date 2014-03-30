#!/usr/bin/env bash
# to use slovastick on local machine install web server 
# or install python and use: python -m SimpleHTTPServer 8077
# 
# for build extension - download "kango" framework
# Kango - cross-browser extension framework - http://kangoextensions.com/

# python kango/kango.py create slovastick_extension/ && \
rm -rf slovastick_extension/src/common/res/ && \
mkdir -p slovastick_extension/src/common/res/ && \
tar -c ../ --exclude ../build --exclude ../test --exclude ../.git | tar -C slovastick_extension/src/common/res/ -x && \
python kango/kango.py build slovastick_extension/ && \
cp slovastick_extension/output/*.crx output/slovastick.crx && \
# cp slovastick_extension/output/*.oex output/slovastick.oex && \
cp slovastick_extension/output/*.xpi output/slovastick.xpi && \
cp slovastick_extension/output/slovastick_* output/ && \
cp slovastick_extension/output/update_* 	output/ && \
echo "done!"