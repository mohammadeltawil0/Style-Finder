package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.SharedOutfitDto;
import CS431.Style_Finder.dto.OutfitDto;

public interface SharedOutfitService {

    //create (or reuse) a shareable link for an outfit
    SharedOutfitDto createShareLink(Long outfitId);

    //get outfit from a shared token (public access)
    OutfitDto getSharedOutfit(String token);

    //optional: disable a shared link
    void revokeShareLink(String token);
}