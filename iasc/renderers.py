import io
import zipfile

from rest_framework.renderers import BaseRenderer
from drf_excel.renderers import XLSXRenderer

import logging

log = logging.getLogger(__name__)


class ZipXLSRenderer(BaseRenderer):
    """
    Render response as Zip file download
    Serializer must pass rows with a file name column for file assignment
    """

    media_type = "application/zip"
    format = "zip"
    charset = "utf-8"
    render_style = "binary"

    def reformat_data(self, data):
        """
        Reformat data by file name
        @param data:
        @return: data
        """

        ret = {}
        for d in data:
            filename = d.pop("filename")

            if filename not in ret.keys():
                ret[filename] = []

            ret[filename].append(d)

        return ret

    def render(self, data, accepted_media_type=None, renderer_context=None):
        xls_renderer = XLSXRenderer()
        zip_buffer = io.BytesIO()

        data = self.reformat_data(data)

        for file in data:
            sheet = xls_renderer.render(
                data[file],
                accepted_media_type=accepted_media_type,
                renderer_context=renderer_context,
            )

            data[file] = io.BytesIO(sheet)

        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for file in data:
                zip_file.writestr(file, data[file].getvalue())

        return zip_buffer.getvalue()
