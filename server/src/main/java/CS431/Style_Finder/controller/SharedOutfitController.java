package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.SharedOutfitDto;
import CS431.Style_Finder.service.SharedOutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class SharedOutfitController {
    private final SharedOutfitService sharedOutfitService;

    @PostMapping("/{outfitId}")
    public ResponseEntity<SharedOutfitDto> createShareLink(@PathVariable Long outfitId) {
        return ResponseEntity.ok(sharedOutfitService.createShareLink(outfitId));
    }

    @GetMapping("/{token}")
    public ResponseEntity<OutfitDto> getSharedOutfit(@PathVariable String token) {
        return ResponseEntity.ok(sharedOutfitService.getSharedOutfit(token));
    }

    @GetMapping("/view/{token}")
    public ResponseEntity<String> viewSharedOutfit(@PathVariable String token) {

        OutfitDto outfit = sharedOutfitService.getSharedOutfit(token);

        StringBuilder html = new StringBuilder();

        html.append("""
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #EDEDE9;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    color: #2f2f2f;
                }

                .container {
                    max-width: 650px;
                    margin: auto;
                    padding: 20px;
                }

                .header {
                    font-size: 28px;
                    font-weight: bold;
                    color: black;
                    margin-bottom: 15px;
                }

                .card {
                    background: #E3D5CA;
                    border-radius: 18px;
                    padding: 20px;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
                }

                .title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .info {
                    margin: 6px 0;
                    font-size: 14px;
                    color: #444;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-top: 15px;
                }

                img {
                    width: 100%;
                    height: 140px;
                    object-fit: cover;
                }

                .divider {
                    height: 1px;
                    background: #B4907B;
                    margin: 12px 0;
                    opacity: 0.5;
                }

                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }

                .button {
                    margin-top: 15px;
                    padding: 10px 16px;
                    background: #949F71;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                }

            </style>
        </head>
        <body>
            <div class="container">

                <div class="header">StyleFinder</div>

                <div class="card">
        """);

        html.append("<div class='title'>Shared Outfit</div>");

        html.append("<div class='info'><strong>Items:</strong> ")
            .append(outfit.getItemIds() != null ? outfit.getItemIds().size() : 0)
            .append("</div>");

        html.append("<div class='info'><strong>Created:</strong> ")
            .append(outfit.getCreatedAt())
            .append("</div>");

        html.append("<div class='divider'></div>");

        html.append("<div class='grid'>");

        if (outfit.getImageUrls() != null) {
            for (String url : outfit.getImageUrls()) {
                html.append("<img src='").append(url).append("'/>");
            }
        }

        html.append("</div>");

        html.append("""
                </div>

                <div class="footer">
                    Shared via StyleFinder
                </div>

            </div>
        </body>
        </html>
        """);

        return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .body(html.toString());
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedOutfitService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}