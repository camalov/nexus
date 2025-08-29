package com.nexus.mapper;

import com.nexus.model.dto.ChatMessageDto;
import com.nexus.model.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MessageMapper {

    MessageMapper INSTANCE = Mappers.getMapper(MessageMapper.class);

    @Mapping(source = "sender.username", target = "senderUsername")
    @Mapping(source = "recipient.username", target = "recipientUsername")
    ChatMessageDto messageToChatMessageDto(Message message);
}
