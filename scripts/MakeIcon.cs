using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;

class MakeIcon
{
    static void Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("Usage: MakeIcon <input.jpg> <output.ico> [output.png]");
            return;
        }

        string inputPath = args[0];
        string outputIco = args[1];
        string outputPng = args.Length > 2 ? args[2] : null;

        using (Image src = Image.FromFile(inputPath))
        {
            // Save main PNG if requested
            if (!string.IsNullOrEmpty(outputPng))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(outputPng));
                using (Bitmap fullBmp = new Bitmap(512, 512, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(fullBmp))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.DrawImage(src, 0, 0, 512, 512);
                    fullBmp.Save(outputPng, ImageFormat.Png);
                }
                Console.WriteLine("Saved PNG to: " + outputPng);
            }

            // Create multi-resolution Windows ICO containing PNGs for 256, 128, 64, 48, 32, 16
            int[] sizes = new int[] { 256, 128, 64, 48, 32, 16 };
            List<byte[]> pngBuffers = new List<byte[]>();

            foreach (int size in sizes)
            {
                using (Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
                using (Graphics g = Graphics.FromImage(bmp))
                using (MemoryStream ms = new MemoryStream())
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.DrawImage(src, 0, 0, size, size);
                    bmp.Save(ms, ImageFormat.Png);
                    pngBuffers.Add(ms.ToArray());
                }
            }

            using (FileStream fs = new FileStream(outputIco, FileMode.Create))
            using (BinaryWriter bw = new BinaryWriter(fs))
            {
                // ICONDIR header
                bw.Write((ushort)0); // Reserved
                bw.Write((ushort)1); // Type 1 = ICO
                bw.Write((ushort)sizes.Length); // Image count

                int offset = 6 + (16 * sizes.Length);

                for (int i = 0; i < sizes.Length; i++)
                {
                    int size = sizes[i];
                    byte bWidth = size >= 256 ? (byte)0 : (byte)size;
                    byte bHeight = size >= 256 ? (byte)0 : (byte)size;

                    bw.Write(bWidth);
                    bw.Write(bHeight);
                    bw.Write((byte)0); // Color count (0 = 256+)
                    bw.Write((byte)0); // Reserved
                    bw.Write((ushort)1); // Planes
                    bw.Write((ushort)32); // Bit count
                    bw.Write((uint)pngBuffers[i].Length); // Size of image data
                    bw.Write((uint)offset); // Offset to image data

                    offset += pngBuffers[i].Length;
                }

                // Write PNG payload for each icon resolution
                for (int i = 0; i < sizes.Length; i++)
                {
                    bw.Write(pngBuffers[i]);
                }
            }

            Console.WriteLine("Saved multi-res ICO to: " + outputIco);
        }
    }
}
