const createTimelineEvent = async (type, user, options = {}) => {
    const { relatedUser, relatedGroup, relatedExpense } = options;
    
    let message = '';
    const eventData = {
      type,
      user,
      relatedUser,
      relatedGroup,
      relatedExpense: relatedExpense
    };
    
    switch (type) {
      case 'expense_added':
        message = `${relatedUser.firstName} ${relatedUser.lastName} added expense "${relatedExpense.title}" (${relatedExpense.amount}) in group "${relatedGroup.name}"`;
        break;
      case 'expense_modified':
        message = `${relatedUser.firstName} ${relatedUser.lastName} modified expense "${relatedExpense.title}" in group "${relatedGroup.name}"`;
        break;
      case 'expense_deleted':
        message = `${relatedUser.firstName} ${relatedUser.lastName} deleted expense in group "${relatedGroup.name}"`;
        break;
      case 'group_created':
        message = `You created group "${relatedGroup.name}"`;
        break;
      case 'group_joined':
        message = `You joined group "${relatedGroup.name}"`;
        break;
      case 'invitation_received':
        message = `You were invited to group "${relatedGroup.name}" by ${relatedUser.firstName} ${relatedUser.lastName}`;
        break;
      default:
        message = 'New activity in your groups';
    }
    
    eventData.message = message;
    
    await TimelineEvent.create(eventData);
  };
  
  const getSuggestedUsers = async (userId) => {
    
    const groups = await Group.find({ members: userId });
    const groupIds = groups.map(group => group._id);
    
    const users = await User.find({
      _id: { $ne: userId },
      groups: { $in: groupIds }
    }).select('firstName lastName profileImage');
    
    return users;
  };
  
  module.exports = {
    createTimelineEvent,
    getSuggestedUsers
  };