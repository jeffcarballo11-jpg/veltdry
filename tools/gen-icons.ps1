Add-Type -AssemblyName System.Drawing

$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class IconGen
{
    static Color C1 = Color.FromArgb(255, 255, 0, 224);   // fuchsia
    static Color C2 = Color.FromArgb(255, 122, 0, 255);   // purple
    static Color C3 = Color.FromArgb(255, 0, 229, 255);   // cyan
    static Color BG = Color.FromArgb(255, 10, 10, 15);
    public static bool Glow = false;

    static RectangleF FullRect = new RectangleF(0, 0, 1080, 1080);
    static RectangleF InnerRect = new RectangleF(310, 310, 460, 460);

    static LinearGradientBrush MakeBrush(int alpha, RectangleF rect)
    {
        var b = new LinearGradientBrush(rect, Color.White, Color.White, LinearGradientMode.ForwardDiagonal);
        var blend = new ColorBlend(3);
        blend.Colors = new Color[] {
            Color.FromArgb(alpha, C1),
            Color.FromArgb(alpha, C2),
            Color.FromArgb(alpha, C3)
        };
        blend.Positions = new float[] { 0f, 0.55f, 1f };
        b.InterpolationColors = blend;
        b.WrapMode = WrapMode.TileFlipXY;
        return b;
    }

    static Pen MakePen(int alpha, float width, RectangleF rect)
    {
        var p = new Pen(MakeBrush(alpha, rect), width);
        p.StartCap = LineCap.Round;
        p.EndCap = LineCap.Round;
        p.LineJoin = LineJoin.Round;
        return p;
    }

    static void GlowStroke(Graphics g, Action<Pen> drawFn, float coreWidth, RectangleF rect)
    {
        if (Glow)
        {
            int[] alphas = { 30, 55, 110 };
            float[] widths = { coreWidth + 34, coreWidth + 18, coreWidth + 6 };
            for (int i = 0; i < 3; i++)
            {
                using (var p = MakePen(alphas[i], widths[i], rect)) drawFn(p);
            }
        }
        using (var p = MakePen(255, coreWidth, rect)) drawFn(p);
    }

    public static void Draw(string type, string outPath)
    {
        var bmp = new Bitmap(1080, 1080);
        using (var g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.Clear(BG);

            // outer brand ring
            var ringRect = new RectangleF(44, 44, 992, 992);
            GlowStroke(g, (p) => g.DrawEllipse(p, ringRect), 9f, FullRect);

            switch (type)
            {
                case "que-es":
                    {
                        using (var font = new Font("Segoe UI", 340, FontStyle.Bold, GraphicsUnit.Pixel))
                        using (var sf = new StringFormat() { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                        using (var path = new GraphicsPath())
                        {
                            path.AddString("?", font.FontFamily, (int)FontStyle.Bold, font.Size, new RectangleF(310, 300, 460, 480), sf);
                            GlowStroke(g, (p) => g.DrawPath(p, path), 9f, InnerRect);
                        }
                        break;
                    }
                case "como-funciona":
                    {
                        int[] xs = { 360, 540, 720 };
                        int r = 26;
                        foreach (var x in xs)
                        {
                            using (var ep = new GraphicsPath())
                            {
                                ep.AddEllipse(x - r, 540 - r, r * 2, r * 2);
                                GlowStroke(g, (p) => g.DrawPath(p, ep), 7f, InnerRect);
                            }
                        }
                        // connectors with arrowheads
                        DrawArrowConnector(g, 386, 540, 500, 540);
                        DrawArrowConnector(g, 566, 540, 680, 540);
                        break;
                    }
                case "demostracion":
                    {
                        var circleRect = new RectangleF(360, 360, 360, 360);
                        GlowStroke(g, (p) => g.DrawEllipse(p, circleRect), 8f, InnerRect);
                        using (var brush = MakeBrush(255, InnerRect))
                        {
                            PointF[] tri = { new PointF(470, 420), new PointF(470, 660), new PointF(665, 540) };
                            g.FillPolygon(brush, tri);
                        }
                        break;
                    }
                case "beneficios":
                    {
                        using (var path = new GraphicsPath())
                        {
                            PointF[] pts = { new PointF(330, 720), new PointF(460, 600), new PointF(565, 665), new PointF(745, 400) };
                            path.AddLines(pts);
                            GlowStroke(g, (p) => g.DrawPath(p, path), 8f, InnerRect);
                        }
                        using (var path2 = new GraphicsPath())
                        {
                            PointF[] flag = { new PointF(655, 400), new PointF(745, 400), new PointF(745, 490) };
                            path2.AddLines(flag);
                            GlowStroke(g, (p) => g.DrawPath(p, path2), 8f, InnerRect);
                        }
                        break;
                    }
                case "contacto":
                    {
                        using (var path = new GraphicsPath())
                        {
                            PointF a = new PointF(715, 365);
                            PointF b2 = new PointF(593, 715);
                            PointF c = new PointF(523, 558);
                            PointF d = new PointF(365, 488);
                            path.AddLines(new PointF[] { a, b2, c, d, a });
                            GlowStroke(g, (p) => g.DrawPath(p, path), 7f, InnerRect);
                            using (var path2 = new GraphicsPath())
                            {
                                path2.AddLine(a, c);
                                GlowStroke(g, (p) => g.DrawPath(p, path2), 7f, InnerRect);
                            }
                        }
                        break;
                    }
            }
        }
        bmp.Save(outPath, ImageFormat.Png);
        bmp.Dispose();
    }

    static void DrawArrowConnector(Graphics g, float x1, float y1, float x2, float y2)
    {
        using (var path = new GraphicsPath())
        {
            path.AddLine(x1, y1, x2, y2);
            GlowStroke(g, (p) => g.DrawPath(p, path), 7f, InnerRect);
        }
        using (var head = new GraphicsPath())
        {
            PointF tip = new PointF(x2 + 14, y2);
            PointF up = new PointF(x2 - 4, y2 - 12);
            PointF down = new PointF(x2 - 4, y2 + 12);
            head.AddLines(new PointF[] { up, tip, down });
            GlowStroke(g, (p) => g.DrawPath(p, head), 7f, InnerRect);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$outDir = "C:\Users\jeffc\OneDrive\CLAUDE CODE\veltdry\assets\img\highlights"

[IconGen]::Draw("que-es", (Join-Path $outDir "1-que-es.png"))
[IconGen]::Draw("como-funciona", (Join-Path $outDir "2-como-funciona.png"))
[IconGen]::Draw("demostracion", (Join-Path $outDir "3-demostracion.png"))
[IconGen]::Draw("beneficios", (Join-Path $outDir "4-beneficios.png"))
[IconGen]::Draw("contacto", (Join-Path $outDir "5-contacto.png"))

Write-Host "Done."
