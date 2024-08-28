try {
  const result = await sequelize.transaction(async t => {
    const user = await User.create(
      {
        firstName: 'Abraham',
        lastName: 'Lincoln',
      }, 
      { transaction: t },
    );

    await user.setShooter(
      {
        firstName: 'John',
        lastName: 'Boothe',
      },
      { transaction: t },
    );

    return user;
  });

  // If the execution reaches this line, the transaction has been committed successfully
  // `result` is whatever was returned from the transaction callback (the `user`, in this case)
} catch (error) {
  // If the execution reaches this line, an error occurred.
  // The transaction has already been rolled back automatically by Sequelize!
}